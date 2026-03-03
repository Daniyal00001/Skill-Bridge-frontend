import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Mail,
  Lock as LockIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo/logo.png";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Redirect based on role from DB ──────────────────────────
  //      Role comes from backend → we redirect accordingly
  const redirectByRole = (role: string) => {
    switch (role) {
      case "CLIENT":
        navigate("/client");
        break;
      case "FREELANCER":
        navigate("/freelancer");
        break;
      case "ADMIN":
        navigate("/admin");
        break;
      default:
        navigate("/client");
    }
  };

  // ── Main login handler ───────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ new signature — object with email + password
      const user = await login({ email, password });

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.name}. Redirecting to your dashboard...`,
      });

      // redirect based on role returned from backend
      redirectByRole(user.role);
    } catch (error) {
      // show exact backend error message
      let message =
        "Invalid email or password. Please check your credentials and try again.";
      let title = "Login failed";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
        if (error.response?.status === 401) {
          title = "Authentication Error";
        } else if (error.response?.status === 404) {
          title = "Account Not Found";
        }
      }

      toast({
        title: title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[60px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[60px]" />

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-card/50 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden relative z-10">
        {/* Left Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <img
              src={logo}
              alt="SkillBridge Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold tracking-tight gradient-text">
              SkillBridge
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
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
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl gradient-hero shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* login with google*/}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              (window.location.href = "http://localhost:5000/api/auth/google")
            }
            className="w-full flex items-center justify-center gap-3 h-12 px-4 border border-border rounded-xl hover:bg-muted transition-colors"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Right Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 gradient-hero relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 border-8 border-white rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 border-8 border-white/50 rounded-full -ml-48 -mb-48" />
          </div>

          <div className="relative z-10">
            <div className="mb-12">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                Growth Focused
              </span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-6">
              The smartest way to hire{" "}
              <span className="text-white/70">freelance talent.</span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              SkillBridge connects world-class experts with forward-thinking
              companies through AI-powered matching and secure workflows.
            </p>
          </div>

          <div className="relative z-10 space-y-6 pt-12 border-t border-white/20">
            {[
              "AI-driven project scoping",
              "Smart talent matching",
              "Escrow-protected payments",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-12">
            <div className="p-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="text-3xl font-bold text-white mb-1">
                Quality first
              </div>
              <div className="text-sm text-white/70">
                Join a platform built on transparency, trust, and AI-powered
                precision.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
