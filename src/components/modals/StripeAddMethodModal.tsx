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
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  Plus,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
    );
  }
  return stripePromise;
};

interface StripeAddMethodModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** 
   * The backend endpoint to create a SetupIntent.
   * - CLIENT:     "/stripe/create-setup-intent"   (default)
   * - FREELANCER: "/stripe/freelancer/setup-intent"
   */
  setupEndpoint?: string;
  title?: string;
  description?: string;
}

function SetupForm({
  clientSecret,
  onSuccess,
  onClose,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onClose: () => void;
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

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) {
        setError(stripeError.message || "Setup failed.");
        setLoading(false);
        return;
      }

      if (setupIntent?.status === "succeeded") {
        toast.success("Payment method saved successfully!");
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save payment method.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Card Details
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
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground italic">
        <Lock className="w-3 h-3" />
        <span>Card details are never stored on our servers.</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-[2] rounded-xl bg-primary text-white font-black hover:opacity-90 h-11"
          disabled={!stripe || !elements || loading || !ready}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {loading ? "Saving..." : "Save Card"}
        </Button>
      </div>
    </form>
  );
}

export function StripeAddMethodModal({
  open,
  onClose,
  onSuccess,
  setupEndpoint = "/stripe/create-setup-intent",
  title = "Add Payment Method",
  description = "Securely add a credit or debit card.",
}: StripeAddMethodModalProps) {
  const { theme } = useTheme();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const initSetup = async () => {
        setLoading(true);
        try {
          const res = await api.post(setupEndpoint);
          setClientSecret(res.data.clientSecret);
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message || "Failed to initialize card setup."
          );
          onClose();
        } finally {
          setLoading(false);
        }
      };
      initSetup();
    } else {
      setClientSecret(null);
    }
  }, [open, setupEndpoint, onClose]);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-border/60 gap-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-7 h-7" />
            </div>
            <DialogTitle className="text-white text-xl font-black">
              {title}
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs mt-1">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium animate-pulse">
                Initializing Secure Session...
              </p>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: isDark ? "night" : "stripe",
                  variables: {
                    colorPrimary: "#6366f1",
                    colorBackground: isDark ? "#1e1e2e" : "#ffffff",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <SetupForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
                onClose={onClose}
              />
            </Elements>
          ) : null}
        </div>

        {/* Security footer */}
        <div className="px-6 pb-5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="w-3 h-3 text-indigo-500" />
          <span>
            256-bit SSL encrypted · Powered by{" "}
            <span className="font-bold text-indigo-600">Stripe</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
