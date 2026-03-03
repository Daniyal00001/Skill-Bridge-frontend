import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordAPI } from "@/lib/auth.service";
import logo from "@/assets/logo/logo.png";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Password Requirements Check ──────────────────────────────
  const passwordRequirements = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
      { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
      { label: "At least one number", met: /[0-9]/.test(password) },
      {
        label: "At least one special character (@$!%*?&)",
        met: /[@$!%*?&]/.test(password),
      },
    ],
    [password],
  );

  const isPasswordValid = useMemo(
    () => passwordRequirements.every((req) => req.met),
    [passwordRequirements],
  );

  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  // If no token in URL → redirect to forgot password
  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordAPI(token!, password);
      setIsSuccess(true);

      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      let message = "Failed to reset password. The link may have expired.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Password reset!</h1>
            <p className="text-muted-foreground">
              Your password has been updated successfully. Redirecting to
              login...
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block text-primary hover:underline font-medium"
          >
            Go to login now
          </Link>
        </div>
      </div>
    );
  }

  // ── Form State ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold gradient-text">SkillBridge</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Set new password</h1>
          <p className="text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase and a
            number.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password Requirements Checklist */}
            {password.length > 0 && (
              <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Security Score
                </p>
                <div className="grid grid-cols-1 gap-1.5">
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
                        {req.met && <CheckCircle className="w-2.5 h-2.5" />}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {/* Match indicator */}
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            disabled={
              isLoading || !isPasswordValid || password !== confirmPassword
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
