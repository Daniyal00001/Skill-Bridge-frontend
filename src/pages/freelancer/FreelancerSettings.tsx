import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Lock,
  Mail,
  Loader2,
  Activity,
  CreditCard,
  ShieldCheck,
  Wallet,
  Phone,
  UploadCloud,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Globe,
  Eye,
  EyeOff,
  ArrowDownToLine,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  History,
  Banknote,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StripeAddMethodModal } from "@/components/modals/StripeAddMethodModal";
import { Plus, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  PENDING: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/10 text-red-600 border-red-200",
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// WithdrawalsTab component (extracted for clarity)
// ─────────────────────────────────────────────────────────────────────────────
function WithdrawalsTab() {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeView, setActiveView] = useState<"withdraw" | "history">(
    "withdraw",
  );
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["freelancerBalance"],
    queryFn: async () => {
      const res = await api.get("/stripe/freelancer/balance");
      return res.data;
    },
  });

  const { data: stripeStatus, isLoading: isLoadingStripe } = useQuery({
    queryKey: ["stripeOnboardingStatus"],
    queryFn: async () => {
      const res = await api.get("/stripe/onboarding-status");
      return res.data;
    },
  });

  const setupStripeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get("/stripe/setup-payouts");
      return res.data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to start Stripe onboarding.",
      );
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.post("/stripe/freelancer/withdraw", { amount });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Withdrawal successful!");
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["freelancerBalance"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Withdrawal failed.");
    },
  });

  const balance = balanceData?.balance ?? 0;
  const totalWithdrawn = balanceData?.totalWithdrawn ?? 0;
  const earningsHistory: any[] = balanceData?.earningsHistory ?? [];
  const withdrawalHistory: any[] = balanceData?.withdrawalHistory ?? [];
  const stripeConnected = balanceData?.stripeConnected ?? false;

  const totalEarned = useMemo(() => {
    return earningsHistory.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [earningsHistory]);

  const witdrawAmountNum = parseFloat(withdrawAmount) || 0;

  const isValidAmount =
    witdrawAmountNum > 0 &&
    witdrawAmountNum <= balance &&
    witdrawAmountNum >= 25;

  const handleWithdraw = () => {
    if (!isValidAmount) return;
    setShowConfirmWithdraw(true);
  };

  const confirmWithdraw = () => {
    setShowConfirmWithdraw(false);
    withdrawMutation.mutate(witdrawAmountNum);
  };

  const handleQuickAmount = (pct: number) => {
    const amt = Math.floor((balance * pct) / 100);
    setWithdrawAmount(amt > 0 ? amt.toFixed(2) : "");
  };

  if (isLoadingBalance || isLoadingStripe) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <Card className="col-span-1 sm:col-span-1 border-none bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]" />
          <CardContent className="pt-6 pb-6 relative">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
              Available Balance
            </p>
            <p className="text-4xl font-black tracking-tight">
              {formatCurrency(balance)}
            </p>
            <p className="text-white/60 text-xs mt-2">Ready to withdraw</p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                Total Earned
              </p>
            </div>
            <p className="text-2xl font-black">{formatCurrency(totalEarned)}</p>
            <p className="text-muted-foreground text-xs mt-1">
              All-time milestones released
            </p>
          </CardContent>
        </Card>

        {/* Total Withdrawn */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ArrowDownToLine className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                Total Withdrawn
              </p>
            </div>
            <p className="text-2xl font-black">
              {formatCurrency(totalWithdrawn)}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Paid out to your account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content ── */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-6">
        {/* LEFT: Withdraw Panel */}
        <div className="space-y-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="h-5 w-5 text-primary" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Transfer your earnings to your connected Stripe account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!stripeStatus?.complete ? (
                /* Stripe not connected */
                <div className="p-6 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-300">
                      Connect Stripe First
                    </p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1">
                      You need to complete Stripe onboarding to receive payouts.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setupStripeMutation.mutate()}
                    disabled={setupStripeMutation.isPending}
                  >
                    {setupStripeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {stripeStatus?.detailsSubmitted
                      ? "Complete Onboarding"
                      : "Connect with Stripe"}
                  </Button>
                </div>
              ) : balance <= 0 ? (
                /* No balance yet */
                <div className="p-6 bg-muted/30 border border-border/40 rounded-2xl text-center space-y-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <DollarSign className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">No Balance to Withdraw</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your balance will grow as clients approve milestones and
                      payment is released from escrow.
                    </p>
                  </div>
                </div>
              ) : (
                /* Withdrawal form */
                <div className="space-y-4">
                  {/* Balance info */}
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <span className="text-sm font-medium text-muted-foreground">
                      Available
                    </span>
                    <span className="font-black text-lg text-primary">
                      {formatCurrency(balance)}
                    </span>
                  </div>

                  {/* Amount input */}
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        $
                      </span>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        min="25"
                        max={balance}
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7 text-lg font-bold h-12"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    {withdrawAmount && witdrawAmountNum > balance && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Amount exceeds available balance
                      </p>
                    )}
                    {withdrawAmount &&
                      witdrawAmountNum < 25 &&
                      witdrawAmountNum > 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Minimum withdrawal is $25.00
                        </p>
                      )}
                  </div>

                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold border-dashed hover:border-primary hover:text-primary"
                        onClick={() => handleQuickAmount(pct)}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>

                  {/* Withdraw button */}
                  <Button
                    className="w-full h-12 text-base font-bold gap-2"
                    disabled={!isValidAmount || withdrawMutation.isPending}
                    onClick={handleWithdraw}
                  >
                    {withdrawMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="h-5 w-5" />
                    )}
                    {withdrawMutation.isPending
                      ? "Processing..."
                      : `Withdraw ${witdrawAmountNum > 0 ? formatCurrency(witdrawAmountNum) : ""}`}
                  </Button>

                  {/* Confirmation Dialog */}
                  <AlertDialog
                    open={showConfirmWithdraw}
                    onOpenChange={setShowConfirmWithdraw}
                  >
                    <AlertDialogContent className="max-w-[400px] border-none bg-card/95 backdrop-blur-xl shadow-2xl">
                      <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Banknote className="h-6 w-6 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black">
                          Confirm Withdrawal?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          You are about to withdraw{" "}
                          <span className="font-bold text-foreground">
                            {formatCurrency(witdrawAmountNum)}
                          </span>{" "}
                          to your connected Stripe account. This action cannot
                          be undone once processed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="border-none bg-muted/50 hover:bg-muted font-bold rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmWithdraw}
                          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20"
                        >
                          Confirm & Withdraw
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p className="text-center text-[10px] text-muted-foreground">
                    Funds are typically available in your Stripe account within
                    2-7 business days.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Stripe status footer */}
            {stripeStatus?.complete && (
              <CardFooter className="border-t pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Stripe Connected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 h-7"
                  onClick={() => setupStripeMutation.mutate()}
                  disabled={setupStripeMutation.isPending}
                >
                  {setupStripeMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Globe className="h-3 w-3" />
                  )}
                  Stripe Dashboard
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* RIGHT: History Panel */}
        <div className="space-y-4">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveView("withdraw")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                activeView === "withdraw"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Earnings
              </span>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                activeView === "history"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <History className="h-4 w-4" />
                Withdrawals
                {withdrawalHistory.length > 0 && (
                  <Badge className="h-4 text-[10px] px-1.5 bg-primary text-primary-foreground border-none">
                    {withdrawalHistory.length}
                  </Badge>
                )}
              </span>
            </button>
          </div>

          <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-md">
            {activeView === "withdraw" ? (
              <>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Earnings History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Payments released from escrow
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {earningsHistory.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm px-6">
                      <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No earnings yet</p>
                      <p className="text-xs mt-1 opacity-70">
                        Complete milestones to start earning
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                      {earningsHistory.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {item.projectTitle}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {timeAgo(item.releasedAt)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-emerald-600 ml-3 flex-shrink-0">
                            +{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-500" />
                    Withdrawal History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your past withdrawal requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {withdrawalHistory.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm px-6">
                      <ArrowDownToLine className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No withdrawals yet</p>
                      <p className="text-xs mt-1 opacity-70">
                        Your withdrawal history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                      {withdrawalHistory.map((w: any) => {
                        const cfg =
                          statusConfig[w.status] ?? statusConfig.PENDING;
                        return (
                          <div
                            key={w.id}
                            className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <ArrowDownToLine className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                  {formatCurrency(w.amount)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {timeAgo(w.requestedAt)}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={cn(
                                "flex items-center gap-1 text-[10px] font-bold border ml-3 flex-shrink-0",
                                cfg.color,
                              )}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Secured by Stripe Financial Connections</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const FreelancerSettings = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);

  const { data: stripeMethods, isLoading: isLoadingMethods } = useQuery({
    queryKey: ["freelancerPaymentMethods"],
    queryFn: async () => {
      const res = await api.get("/stripe/freelancer/payment-methods");
      return res.data;
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const res = await api.delete(`/stripe/freelancer/payment-methods/${methodId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["freelancerPaymentMethods"] });
      toast.success("Payment method removed.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove payment method.");
    },
  });

  const passwordRequirements = useMemo(
    () => [
      {
        label: "At least 8 characters",
        met: passwords.newPassword.length >= 8,
      },
      { label: "Uppercase letter", met: /[A-Z]/.test(passwords.newPassword) },
      { label: "Lowercase letter", met: /[a-z]/.test(passwords.newPassword) },
      { label: "One number", met: /[0-9]/.test(passwords.newPassword) },
      {
        label: "Special character (@$!%*?&)",
        met: /[@$!%*?&]/.test(passwords.newPassword),
      },
    ],
    [passwords.newPassword],
  );

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["freelancerProfile"],
    queryFn: async () => {
      const res = await api.get("/freelancers/me");
      return res.data;
    },
  });

  const [idFile, setIdFile] = useState<File | null>(null);

  const uploadIdMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("idDocument", file);
      const res = await api.post("/freelancers/onboarding/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("ID Document uploaded successfully!");
      setIdFile(null);
      queryClient.invalidateQueries({ queryKey: ["freelancerProfile"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to upload ID document.",
      );
    },
  });

  const handleIdUpload = () => {
    if (!idFile) return;
    uploadIdMutation.mutate(idFile);
  };

  const user = profileResponse?.data?.user || {};
  const profile = profileResponse?.data || {};

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwords) => {
      const res = await api.put("/auth/change-password", data);
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "" });
      queryClient.invalidateQueries({ queryKey: ["freelancerProfile"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update password");
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put("/auth/notification-settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Notification settings updated");
      queryClient.invalidateQueries({ queryKey: ["freelancerProfile"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to update notifications",
      );
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const isFirstTimePassword = user.googleId && !user.hasPassword;

    if (isFirstTimePassword) {
      if (!passwords.newPassword) {
        return toast.error("Please enter a new password");
      }
    } else {
      if (!passwords.currentPassword || !passwords.newPassword) {
        return toast.error("Please fill in all password fields");
      }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (passwords.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (!passwordRegex.test(passwords.newPassword)) {
      return toast.error(
        "Password must include uppercase, lowercase, number and special character (@$!%*?&)",
      );
    }
    changePasswordMutation.mutate(passwords);
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage your freelancer account and payment preferences.
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border",
              user.idVerificationStatus === "APPROVED"
                ? "bg-green-500/10 border-green-200 text-green-600"
                : user.idVerificationStatus === "PENDING"
                  ? "bg-blue-500/10 border-blue-200 text-blue-600"
                  : user.idVerificationStatus === "REJECTED"
                    ? "bg-red-500/10 border-red-200 text-red-600"
                    : "bg-amber-500/10 border-amber-200 text-amber-600",
            )}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold">
              ID:{" "}
              {user.idVerificationStatus === "APPROVED"
                ? "Verified"
                : user.idVerificationStatus === "PENDING"
                  ? "Under Review"
                  : user.idVerificationStatus === "REJECTED"
                    ? "Rejected"
                    : "Not Submitted"}
            </span>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" /> Account
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <Wallet className="h-4 w-4" /> Withdrawals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Activity className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" /> Billing
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent
            value="account"
            className="animate-in fade-in-50 duration-500"
          >
            <div className="max-w-xl mx-auto space-y-6">
              <Card className="border-border/40 bg-card/80 shadow-md">
                <CardHeader className="pb-3 text-left">
                  <CardTitle className="text-lg font-bold">
                    Account Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Email Address</span>
                    </div>
                    <Badge
                      className={cn(
                        "border-none",
                        user.isEmailVerified
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Phone Number</span>
                    </div>
                    <Badge
                      className={cn(
                        "border-none",
                        user.isPhoneVerified
                          ? "bg-green-500/10 text-green-500"
                          : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      {user.isPhoneVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div> */}
                </CardContent>
              </Card>

              {/* Identity Verification Section */}
              <Card className="border-border/40 bg-card/80 shadow-md">
                <CardHeader className="pb-3 text-left">
                  <CardTitle className="text-lg font-bold">
                    Identity Verification
                  </CardTitle>
                  <CardDescription>
                    Upload your national ID or passport
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-sm">Status:</span>
                    </div>
                    {user.idVerificationStatus === "APPROVED" && (
                      <Badge className="bg-green-500/10 text-green-500 border-none">
                        <CheckCircle className="h-3 w-3 mr-1" /> Approved
                      </Badge>
                    )}
                    {user.idVerificationStatus === "PENDING" && (
                      <Badge className="bg-blue-500/10 text-blue-500 border-none">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />{" "}
                        Pending Review
                      </Badge>
                    )}
                    {user.idVerificationStatus === "REJECTED" && (
                      <Badge variant="destructive" className="border-none">
                        <XCircle className="h-3 w-3 mr-1" /> Rejected
                      </Badge>
                    )}
                    {(!user.idVerificationStatus ||
                      user.idVerificationStatus === "UNSUBMITTED") && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-none">
                        Unsubmitted
                      </Badge>
                    )}
                  </div>

                  {user.idVerificationStatus === "REJECTED" &&
                    user.idRejectionReason && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs leading-relaxed border border-red-100">
                        <span className="font-bold block mb-1">
                          Reason for Rejection:
                        </span>
                        {user.idRejectionReason}
                      </div>
                    )}

                  {user.idVerificationStatus === "PENDING" && (
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-blue-900 text-sm">
                          Verification in Progress
                        </p>
                        <p className="text-xs text-blue-700/70">
                          Your documents are being reviewed by our team. This
                          usually takes 24-48 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {user.idVerificationStatus === "APPROVED" && (
                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-900 text-sm">
                          Identity Verified
                        </p>
                        <p className="text-xs text-emerald-700/70">
                          Your identity has been fully verified. You can now
                          access all platform features.
                        </p>
                      </div>
                    </div>
                  )}

                  {(!user.idVerificationStatus ||
                    user.idVerificationStatus === "UNSUBMITTED" ||
                    user.idVerificationStatus === "REJECTED") && (
                    <div className="space-y-3 pt-2">
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 relative">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIdFile(e.target.files[0]);
                            }
                          }}
                        />
                        {!idFile ? (
                          <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground font-medium">
                              Click or drag file to upload
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              JPEG, PNG, or WEBP max 5MB
                            </p>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ShieldCheck className="h-8 w-8 text-primary mb-1" />
                            <p className="text-xs font-semibold">
                              {idFile.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Click to change file
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        disabled={!idFile || uploadIdMutation.isPending}
                        onClick={handleIdUpload}
                      >
                        {uploadIdMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Submit for Verification
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent
            value="security"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Password &amp; Security</CardTitle>
                <CardDescription>
                  Update your credentials regularly to stay safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.googleId && (
                  <div className="p-3 bg-blue-500/5 border border-blue-200/50 rounded-lg flex items-center gap-3 mb-4">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <p className="text-[11px] text-blue-700 font-medium">
                      Linked with Google.{" "}
                      {user.hasPassword
                        ? "You can login with either Google or your password."
                        : "Set a password to enable email/password login alongside Google."}
                    </p>
                  </div>
                )}

                {(!user.googleId || user.hasPassword) && (
                  <div className="space-y-2 text-left">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <Label htmlFor="new-password">
                    {user.googleId && !user.hasPassword
                      ? "Set Password"
                      : "New Password"}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        user.googleId && !user.hasPassword
                          ? "Create a new password"
                          : "Enter new password"
                      }
                      className="pr-10"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements Checklist */}
                  {passwords.newPassword.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Security Requirements
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300",
                                req.met
                                  ? "bg-primary text-white scale-110"
                                  : "bg-muted-foreground/20",
                              )}
                            >
                              {req.met && (
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[10px] transition-colors duration-300",
                                req.met
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {user.googleId && !user.hasPassword
                    ? "Set Password"
                    : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent
            value="withdrawals"
            className="animate-in fade-in-50 duration-500"
          >
            <WithdrawalsTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Freelancer Notifications</CardTitle>
                <CardDescription>
                  Stay updated on new projects and invitations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Project Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified about new job matches and invitations.
                    </p>
                  </div>
                  <Switch
                    checked={user.projectNotifications ?? true}
                    onCheckedChange={(checked) =>
                      updateNotificationsMutation.mutate({
                        projectNotifications: checked,
                      })
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Messages</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you receive a message.
                    </p>
                  </div>
                  <Switch
                    checked={user.messageNotifications ?? true}
                    onCheckedChange={(checked) =>
                      updateNotificationsMutation.mutate({
                        messageNotifications: checked,
                      })
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Account Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Security and platform notifications.
                    </p>
                  </div>
                  <Switch
                    checked={user.accountNotifications ?? true}
                    onCheckedChange={(checked) =>
                      updateNotificationsMutation.mutate({
                        accountNotifications: checked,
                      })
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="billing"
            className="animate-in fade-in-50 duration-500"
          >
            <div className="space-y-6 max-w-2xl mx-auto">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden text-left">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Manage your cards for purchasing SkillTokens.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddMethod(true)}
                      className="rounded-xl font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Method
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingMethods ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : stripeMethods?.methods?.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {stripeMethods.methods.map((method: any) => (
                        <div
                          key={method.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-10 rounded-lg bg-muted flex items-center justify-center border border-border/60">
                              <CreditCard className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="font-bold text-sm capitalize">
                                {method.brand} •••• {method.last4}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                Expires {method.expMonth}/{method.expYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-black uppercase tracking-tighter"
                            >
                              Verified
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                deleteMethodMutation.mutate(method.id)
                              }
                              disabled={deleteMethodMutation.isPending}
                            >
                              {deleteMethodMutation.isPending &&
                              deleteMethodMutation.variables === method.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="p-12 flex flex-col items-center gap-4 text-muted-foreground cursor-pointer hover:bg-muted/20 transition-all border-y border-dashed mt-[-1px]"
                      onClick={() => setShowAddMethod(true)}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-primary/40" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">
                          No payment cards found
                        </p>
                        <p className="text-xs">
                          Attach a card to quickly purchase SkillTokens.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl mt-2 font-bold px-8"
                      >
                        Add My First Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-left">
                <ShieldCheck className="w-8 h-8 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">
                    Industrial-Grade Security
                  </p>
                  <p className="text-[11px] text-indigo-700/70 leading-relaxed font-medium">
                    Payments are encrypted and processed by Stripe. Your sensitive card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <StripeAddMethodModal
        open={showAddMethod}
        onClose={() => setShowAddMethod(false)}
        setupEndpoint="/stripe/freelancer/setup-intent"
        title="Add Card for Token Purchases"
        description="Securely save a card to buy SkillTokens instantly."
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["freelancerPaymentMethods"],
          });
          toast.success("Payment method saved!");
        }}
      />
    </DashboardLayout>
  );
};

export default FreelancerSettings;
