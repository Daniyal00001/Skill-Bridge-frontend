import { useState, useEffect, useCallback } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Shield,
  Lock,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
  Coins,
  Zap,
  History,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

// ─── Stripe singleton ──────────────────────────────────────────────────────
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    );
  }
  return stripePromise;
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface TokenPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  moneyBalance: number;
  currentTokenBalance: number;
  onSuccess: () => void;
}

type PaymentTab = "BALANCE" | "CARD";
type CardStep = "select" | "new_card" | "processing" | "done";

// ─── Brand icon helper ─────────────────────────────────────────────────────
function CardBrand({ brand }: { brand?: string }) {
  const b = (brand || "").toLowerCase();
  const map: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
  };
  return <span>{map[b] || "💳"}</span>;
}

// ─── New Card Form (Stripe Elements) ────────────────────────────────────────
function NewCardForm({
  clientSecret,
  paymentIntentId,
  amount,
  tokens,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  tokens: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } },
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        setLoading(false);
        return;
      }

      await api.post("/tokens/buy-with-card/confirm", { paymentIntentId });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Payment confirmation failed.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary */}
      <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Charge
          </p>
          <p className="text-xl font-black">${amount}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            You Receive
          </p>
          <p className="text-xl font-black text-amber-500">{tokens} Tokens</p>
        </div>
      </div>

      {/* Card Element */}
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Card Details
        </Label>
        <div
          className={cn(
            "rounded-xl border border-border/60 p-4 transition-all min-h-[60px]",
            isDark ? "bg-[#1e1e2e]" : "bg-white",
            !ready && "animate-pulse",
          )}
        >
          <div className={cn(ready ? "block" : "hidden")}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: isDark ? "#e2e8f0" : "#1a1a1a",
                    "::placeholder": {
                      color: isDark ? "#64748b" : "#a1a1aa",
                    },
                    fontFamily: "Inter, system-ui, sans-serif",
                  },
                  invalid: { color: "#f87171" },
                },
              }}
              onReady={() => setReady(true)}
            />
          </div>
          {!ready && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>256-bit SSL · Powered by Stripe</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-[2] rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black h-11 shadow-lg shadow-amber-500/20"
          disabled={!stripe || !elements || loading || !ready}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Shield className="w-4 h-4 mr-2" />
          )}
          {loading ? "Processing..." : `Pay $${amount}`}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
export function TokenPurchaseModal({
  open,
  onClose,
  moneyBalance,
  currentTokenBalance,
  onSuccess,
}: TokenPurchaseModalProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Auto-start on CARD tab if freelancer has no earned balance
  const [tab, setTab] = useState<PaymentTab>(() =>
    moneyBalance > 0 ? "BALANCE" : "CARD",
  );
  const [amountStr, setAmountStr] = useState("");
  const [cardStep, setCardStep] = useState<CardStep>("select");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [loadingSavedPay, setLoadingSavedPay] = useState(false);

  // Stripe payment intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Success state
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [isConfirmingBalance, setIsConfirmingBalance] = useState(false);

  // Saved cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  const amount = Number(amountStr) || 0;
  const tokensToGet = Math.floor(amount * 10);

  // ── Reset on close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        // Restore the correct default tab based on current balance
        setTab(moneyBalance > 0 ? "BALANCE" : "CARD");
        setAmountStr("");
        setCardStep("select");
        setClientSecret(null);
        setPaymentIntentId(null);
        setPurchaseComplete(false);
        setSelectedCardId(null);
        setIsConfirmingBalance(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open, moneyBalance]);

  // ── Fetch saved cards when CARD tab is active ─────────────────────────────
  const fetchSavedCards = useCallback(async () => {
    setLoadingCards(true);
    try {
      const res = await api.get("/stripe/freelancer/payment-methods");
      setSavedCards(res.data.methods || []);
      if (res.data.methods?.length > 0) {
        setSelectedCardId(res.data.methods[0].id);
      }
    } catch {
      // silently fail — new card flow is still available
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "CARD") {
      fetchSavedCards();
    }
  }, [open, tab, fetchSavedCards]);

  // ── Delete a saved card ─────────────────────────────────────────────────
  const handleDeleteCard = async (cardId: string) => {
    setDeletingCard(cardId);
    try {
      await api.delete(`/stripe/freelancer/payment-methods/${cardId}`);
      setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
      if (selectedCardId === cardId) {
        const remaining = savedCards.filter((c) => c.id !== cardId);
        setSelectedCardId(remaining.length > 0 ? remaining[0].id : null);
      }
      queryClient.invalidateQueries({ queryKey: ["freelancerPaymentMethods"] });
      toast.success("Card removed.");
    } catch {
      toast.error("Failed to remove card.");
    } finally {
      setDeletingCard(null);
    }
  };

  // ── Balance purchase ───────────────────────────────────────────────────────
  const handleBalancePurchase = async () => {
    setLoadingBalance(true);
    try {
      const res = await api.post("/tokens/buy", { amountOfMoney: amount });
      toast.success(res.data.message);
      setPurchaseComplete(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Purchase failed.");
    } finally {
      setLoadingBalance(false);
    }
  };

  // ── Pay with saved card ────────────────────────────────────────────────────
  const handlePayWithSavedCard = async () => {
    if (!selectedCardId) return;
    setLoadingSavedPay(true);
    try {
      // 1. Create payment intent
      const intentRes = await api.post("/tokens/buy-with-card/intent", {
        amountOfMoney: amount,
      });
      const { clientSecret: cs, paymentIntentId: pid } = intentRes.data;

      // 2. Confirm using saved payment method (no CardElement needed)
      const stripe = await getStripe();
      if (!stripe) throw new Error("Stripe not loaded.");

      const { error: stripeError } = await stripe.confirmCardPayment(cs, {
        payment_method: selectedCardId,
      });

      if (stripeError) throw new Error(stripeError.message);

      // 3. Confirm with backend
      await api.post("/tokens/buy-with-card/confirm", {
        paymentIntentId: pid,
      });

      setPurchaseComplete(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Payment failed.",
      );
    } finally {
      setLoadingSavedPay(false);
    }
  };

  // ── Proceed to new-card Stripe form ───────────────────────────────────────
  const handleProceedNewCard = async () => {
    setLoadingIntent(true);
    try {
      const res = await api.post("/tokens/buy-with-card/intent", {
        amountOfMoney: amount,
      });
      setClientSecret(res.data.clientSecret);
      setPaymentIntentId(res.data.paymentIntentId);
      setCardStep("new_card");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to initialize payment.",
      );
    } finally {
      setLoadingIntent(false);
    }
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const isAmountValid = amount >= 1;
  const hasInsufficientBalance = tab === "BALANCE" && amount > moneyBalance;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-border/40 gap-0 shadow-2xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-400/5 to-transparent p-6 border-b border-border/40">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">
                  Purchase SkillTokens
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  $1 = 10 tokens · No hidden fees
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* ── SUCCESS SCREEN ───────────────────────────────────── */}
          {purchaseComplete && (
            <div className="flex flex-col items-center text-center gap-5 py-4 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">Tokens Credited! 🚀</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  <span className="font-black text-amber-500">
                    {tokensToGet} SkillTokens
                  </span>{" "}
                  have been added to your account.
                </p>
              </div>
              <Button
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 shadow-lg shadow-emerald-500/20"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Excellent, Let's go!
              </Button>
            </div>
          )}

          {!purchaseComplete && (
            <>
              {/* ── PAYMENT METHOD TABS ─────────────────────────── */}
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as PaymentTab);
                  setCardStep("select");
                  setClientSecret(null);
                  setIsConfirmingBalance(false);
                }}
              >
                <TabsList className="grid grid-cols-2 rounded-2xl p-1 bg-muted/40 h-11 mb-1">
                  <TabsTrigger
                    value="BALANCE"
                    className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:shadow-sm"
                  >
                    <History className="w-3.5 h-3.5" />
                    Earned Balance
                  </TabsTrigger>
                  <TabsTrigger
                    value="CARD"
                    className="rounded-xl font-bold text-xs gap-1.5 data-[state=active]:shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Debit / Credit Card
                  </TabsTrigger>
                </TabsList>

                {/* ─ BALANCE TAB ─────────────────────────────────── */}
                <TabsContent value="BALANCE" className="m-0 space-y-5">
                  {/* Balance pill */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/30 text-left">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Earned Balance
                      </p>
                      <p className="text-xl font-black mt-1">
                        $
                        {moneyBalance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="bg-amber-50/60 dark:bg-amber-500/5 rounded-2xl p-4 border border-amber-200/40 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Token Balance
                      </p>
                      <p className="text-xl font-black text-amber-500 mt-1">
                        {currentTokenBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 px-1">
                    <CheckCircle2 className="w-3 h-3" />
                    No transaction fees when using earned balance
                  </p>

                  {/* Amount input */}
                  <AmountInput
                    value={amountStr}
                    onChange={setAmountStr}
                    tokensToGet={tokensToGet}
                    hasError={hasInsufficientBalance}
                    errorMessage={`Insufficient balance — you have $${moneyBalance.toFixed(2)}`}
                  />

                  {/* CTA */}
                  <div className="flex gap-3">
                    {!isConfirmingBalance ? (
                      <>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-xl font-bold"
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-[2] rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black h-11 shadow-lg shadow-amber-500/20"
                          disabled={
                            loadingBalance ||
                            !isAmountValid ||
                            hasInsufficientBalance
                          }
                          onClick={() => setIsConfirmingBalance(true)}
                        >
                          {loadingBalance ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          {loadingBalance
                            ? "Processing..."
                            : "Purchase with Balance"}
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col w-full gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
                            Confirm purchase of{" "}
                            <span className="text-amber-600 dark:text-amber-500 font-black">
                              {tokensToGet.toLocaleString()} SkillTokens
                            </span>{" "}
                            for{" "}
                            <span className="text-amber-600 dark:text-amber-500 font-black">
                              ${amount}
                            </span>
                            ?
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl font-bold border-border/60"
                            onClick={() => setIsConfirmingBalance(false)}
                            disabled={loadingBalance}
                          >
                            No, Go Back
                          </Button>
                          <Button
                            className="flex-[2] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 shadow-lg shadow-emerald-500/20"
                            onClick={handleBalancePurchase}
                            disabled={loadingBalance}
                          >
                            {loadingBalance ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Zap className="w-4 h-4 mr-2" />
                            )}
                            Yes, Confirm
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ─ CARD TAB ─────────────────────────────────────── */}
                <TabsContent value="CARD" className="m-0 space-y-5">
                  {/* Step: select / saved-card picker */}
                  {cardStep === "select" && (
                    <>
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/5 border border-indigo-100/50">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 leading-tight">
                          Payments processed securely via Stripe. Cards are
                          saved to your Billing tab.
                        </p>
                      </div>

                      {/* Amount input */}
                      <AmountInput
                        value={amountStr}
                        onChange={setAmountStr}
                        tokensToGet={tokensToGet}
                        hasError={false}
                      />

                      {/* Saved cards */}
                      {loadingCards ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Loading saved cards…
                          </span>
                        </div>
                      ) : savedCards.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Saved Cards
                          </p>
                          <RadioGroup
                            value={selectedCardId ?? ""}
                            onValueChange={setSelectedCardId}
                            className="space-y-2"
                          >
                            {savedCards.map((card) => (
                              <div
                                key={card.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                  selectedCardId === card.id
                                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/5"
                                    : "border-border/50 hover:border-border",
                                )}
                                onClick={() => setSelectedCardId(card.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={card.id}
                                    id={card.id}
                                    className="border-amber-400 text-amber-500"
                                  />
                                  <div className="w-9 h-7 rounded bg-muted border border-border/40 flex items-center justify-center text-base">
                                    <CardBrand brand={card.brand} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-black capitalize">
                                      {card.brand} •••• {card.last4}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Expires {card.expMonth}/{card.expYear}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCard(card.id);
                                  }}
                                  disabled={deletingCard === card.id}
                                >
                                  {deletingCard === card.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </RadioGroup>

                          {/* Actions: pay with saved card OR use new */}
                          <div className="flex gap-3 pt-1">
                            <Button
                              variant="outline"
                              className="flex-1 rounded-xl font-bold text-xs gap-1.5 h-10"
                              onClick={handleProceedNewCard}
                              disabled={!isAmountValid || loadingIntent}
                            >
                              {loadingIntent ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                              Use New Card
                            </Button>
                            <Button
                              className="flex-[2] rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black h-10 shadow-lg shadow-amber-500/20 text-sm"
                              disabled={
                                !isAmountValid ||
                                !selectedCardId ||
                                loadingSavedPay
                              }
                              onClick={handlePayWithSavedCard}
                            >
                              {loadingSavedPay ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Shield className="w-4 h-4 mr-2" />
                              )}
                              {loadingSavedPay
                                ? "Processing…"
                                : `Pay $${amount || "0"}`}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* No saved cards → single CTA to new card form */
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground text-center">
                            No saved cards.{" "}
                            <button
                              className="text-primary font-bold underline underline-offset-2"
                              onClick={() =>
                                toast.info(
                                  "Go to Settings → Billing to save a card for future use.",
                                )
                              }
                            >
                              Save a card in Billing settings
                            </button>{" "}
                            or pay with a new card below.
                          </p>
                          <div className="flex gap-3">
                            <Button
                              variant="ghost"
                              className="flex-1 rounded-xl font-bold"
                              onClick={onClose}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-[2] rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black h-11 shadow-lg shadow-amber-500/20"
                              disabled={!isAmountValid || loadingIntent}
                              onClick={handleProceedNewCard}
                            >
                              {loadingIntent ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-2" />
                              )}
                              {loadingIntent
                                ? "Preparing..."
                                : "Proceed to Payment"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step: new card Stripe form */}
                  {cardStep === "new_card" && clientSecret && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <Elements
                        stripe={getStripe()}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: isDark ? "night" : "stripe",
                            variables: {
                              colorPrimary: "#f59e0b",
                              colorBackground: isDark ? "#1e1e2e" : "#ffffff",
                              borderRadius: "12px",
                            },
                          },
                        }}
                      >
                        <NewCardForm
                          clientSecret={clientSecret}
                          paymentIntentId={paymentIntentId!}
                          amount={amount}
                          tokens={tokensToGet}
                          onBack={() => setCardStep("select")}
                          onSuccess={() => setPurchaseComplete(true)}
                        />
                      </Elements>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Shared Amount Input ─────────────────────────────────────────────────────
function AmountInput({
  value,
  onChange,
  tokensToGet,
  hasError,
  errorMessage,
}: {
  value: string;
  onChange: (v: string) => void;
  tokensToGet: number;
  hasError: boolean;
  errorMessage?: string;
}) {
  const PRESETS = [5, 10, 25, 50];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-0.5">
        <Label
          htmlFor="tokenAmount"
          className="text-xs font-black uppercase tracking-widest text-muted-foreground"
        >
          Amount to Spend
        </Label>
        <span className="text-[10px] font-bold text-muted-foreground italic">
          Rate: $1 = 10 Tokens
        </span>
      </div>

      <div className="relative group">
        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-amber-600" />
        <Input
          id="tokenAmount"
          type="number"
          min="1"
          placeholder="Enter amount (e.g. 10)"
          className="pl-10 h-14 rounded-2xl text-xl font-black border-border/60 focus-visible:ring-amber-500/30 focus-visible:border-amber-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {hasError && errorMessage && (
        <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold px-1">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </div>
      )}

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((v) => (
          <Button
            key={v}
            type="button"
            variant="outline"
            className={cn(
              "rounded-xl h-9 font-bold text-sm border-border/40 hover:border-amber-500 hover:bg-amber-500/5",
              Number(value) === v &&
                "border-amber-500 bg-amber-500/5 text-amber-600",
            )}
            onClick={() => onChange(v.toString())}
          >
            ${v}
          </Button>
        ))}
      </div>

      {/* Token preview */}
      {tokensToGet > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/5 text-amber-600 rounded-2xl px-5 py-3 border border-amber-500/10 animate-in zoom-in-95 duration-300">
          <Zap className="w-5 h-5 fill-amber-500 shrink-0" />
          <div>
            <p className="text-[10px] font-bold leading-none uppercase tracking-widest opacity-70">
              You will receive
            </p>
            <p className="text-2xl font-black">
              {tokensToGet.toLocaleString()} SkillTokens
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
