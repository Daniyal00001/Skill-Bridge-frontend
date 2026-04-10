import { useState, useEffect } from "react";
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
import {
  Shield,
  Lock,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Stripe singleton (loaded once) ──────────────────────────
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
    );
  }
  return stripePromise;
};

// ─── Types ───────────────────────────────────────────────────
interface StripeFundModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  milestone: {
    id: string;
    title: string;
    amount: number;
    order: number;
  };
  onSuccess: () => void;
}

type FundStep = "confirm" | "payment" | "processing" | "success";

// ─── Sub-Component: Payment Form ──────────────────────────────
function PaymentForm({
  clientSecret,
  paymentIntentId,
  contractId,
  milestoneId,
  onPaymentSuccess,
  totalCharge,
  onBack,
}: {
  clientSecret: string;
  paymentIntentId: string;
  contractId: string;
  milestoneId: string;
  onPaymentSuccess: () => void;
  totalCharge: number;
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

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        setLoading(false);
        return;
      }

      // ── Step 3: Confirm with backend ──────────────────────
      await api.post("/stripe/confirm-fund", {
        contractId,
        milestoneId,
        paymentIntentId,
      });

      onPaymentSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Payment confirmation failed.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-black mb-1">Card Details</p>
        <p className="text-xs text-muted-foreground mb-4">
          Your card is charged{" "}
          <span className="font-bold text-foreground">
            ${totalCharge.toLocaleString()} USD
          </span>{" "}
          and held in escrow
        </p>

        <div
          className={cn(
            "rounded-xl border border-border/60 p-4 transition-all min-h-[60px]",
            isDark ? "bg-[#1e1e2e]" : "bg-white",
            !ready && "animate-pulse"
          )}
        >
          <div className={cn(ready ? "block" : "hidden")}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: isDark ? '#e2e8f0' : '#1a1a1a',
                    '::placeholder': { color: isDark ? '#64748b' : '#a1a1aa' },
                    fontFamily: "Inter, system-ui, sans-serif",
                  },
                  invalid: { color: '#f87171' },
                },
              }}
              onReady={() => setReady(true)}
            />
          </div>
          {!ready && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Test Mode Tip */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Dev Tip: Faster Withdrawals</p>
            <p className="text-[10px] text-indigo-600 leading-relaxed">
              In test mode, use <span className="font-mono bg-indigo-100 px-1 rounded">4000 0000 0000 0077</span> to make funds available <span className="font-bold">instantly</span> for freelancer withdrawals.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>256-bit SSL encryption powered by</span>
        <span className="font-black text-[#635BFF]">Stripe</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black hover:opacity-90 h-11"
          disabled={!stripe || !elements || loading || !ready}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <DollarSign className="w-4 h-4 mr-2" />
          )}
          {loading ? "Processing..." : "Pay & Lock in Escrow"}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────
export function StripeFundModal({
  open,
  onClose,
  contractId,
  milestone,
  onSuccess,
}: StripeFundModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<FundStep>("confirm");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep("confirm");
        setClientSecret(null);
        setPaymentIntentId(null);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const res = await api.post("/stripe/create-payment-intent", {
        contractId,
        milestoneId: milestone.id,
      });
      setClientSecret(res.data.clientSecret);
      setPaymentIntentId(res.data.paymentIntentId);
      setStep("payment");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const totalCharge = milestone.amount;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-border/60 gap-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-black">
                  Fund Milestone
                </DialogTitle>
                <DialogDescription className="text-indigo-200 text-xs mt-0.5">
                  Secured by Stripe • Held in Escrow
                </DialogDescription>
              </div>
            </div>

            <div className="mt-4 bg-white/10 rounded-xl p-4 space-y-1">
              <p className="text-xs text-indigo-200 font-semibold uppercase tracking-widest">
                Milestone #{milestone.order + 1}
              </p>
              <p className="font-black text-base leading-snug">
                {milestone.title}
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black">
                  ${milestone.amount.toLocaleString()}
                </span>
                <span className="text-indigo-300 text-sm font-medium">USD</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6">
          {step === "confirm" && (
            <div className="space-y-5">
              <div className="space-y-3">
                {[
                  {
                    icon: <Lock className="w-4 h-4 text-indigo-500" />,
                    title: "Funds held in secure escrow",
                    desc: "Your money is protected until you approve the work.",
                  },
                  {
                    icon: <Shield className="w-4 h-4 text-emerald-500" />,
                    title: "Only released on your approval",
                    desc: "Freelancer gets paid only after you verify deliverables.",
                  },
                  {
                    icon: <CreditCard className="w-4 h-4 text-violet-500" />,
                    title: "Powered by Stripe",
                    desc: "Secure 256-bit encryption. Safe and reliable.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-muted/30">
                  <span className="text-sm text-muted-foreground font-medium">Milestone Amount</span>
                  <span className="font-bold">${milestone.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 border-t border-border/60 bg-muted/10">
                  <span className="text-sm font-black">Total Charge</span>
                  <span className="font-black text-indigo-600 text-lg">${totalCharge.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:opacity-90"
                  onClick={handleProceedToPayment}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  {loading ? "Initializing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && clientSecret && (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: isDark ? "night" : "stripe",
                  variables: {
                    colorPrimary: "#6366f1",
                    colorBackground: isDark ? "#1e1e2e" : "#ffffff",
                    colorText: isDark ? "#e2e8f0" : "#1a1a1a",
                    colorDanger: "#f87171",
                    fontFamily: "Inter, system-ui, sans-serif",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId!}
                contractId={contractId}
                milestoneId={milestone.id}
                totalCharge={totalCharge}
                onBack={() => setStep("confirm")}
                onPaymentSuccess={() => setStep("success")}
              />
            </Elements>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black">Funds Locked! 🔒</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  <span className="font-bold text-foreground">${milestone.amount.toLocaleString()}</span> is now held in secure escrow for <span className="font-bold text-foreground">"{milestone.title}"</span>.
                </p>
              </div>
              <Button
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                View Updated Contract
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
