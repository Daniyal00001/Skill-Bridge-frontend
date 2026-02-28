import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Briefcase,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/logo/logo.png";

type Role = "CLIENT" | "FREELANCER";

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCompleteSignup = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      await api.post("/auth/complete-google-signup", { role: selectedRole });

      // Refresh user data in AuthContext to get the new role
      await refreshUser();

      toast({
        title: "Profile setup complete!",
        description: `You are now registered as a ${selectedRole.toLowerCase()}.`,
      });

      // Redirect based on role
      if (selectedRole === "CLIENT") {
        navigate("/client");
      } else {
        navigate("/freelancer");
      }
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description:
          error.response?.data?.message || "An error occurred during setup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[60px] animate-pulse-ultra-slow smooth-gpu" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[60px] animate-pulse-ultra-slow smooth-gpu" />

      <div className="w-full max-w-2xl bg-card/50 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-2xl p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src={logo}
            alt="SkillBridge Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-3xl font-bold tracking-tight gradient-text">
            SkillBridge
          </span>
        </div>

        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          One last step
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-md">
          Welcome,{" "}
          <span className="text-foreground font-semibold">{user?.name}</span>!
          How do you plan to use SkillBridge?
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full mb-10">
          {/* Client Role */}
          <button
            onClick={() => setSelectedRole("CLIENT")}
            className={`relative group flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 ${
              selectedRole === "CLIENT"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
            }`}
          >
            {selectedRole === "CLIENT" && (
              <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-primary animate-in zoom-in" />
            )}
            <div
              className={`p-4 rounded-2xl mb-4 transition-colors ${
                selectedRole === "CLIENT"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <UserCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">I want to hire</h2>
            <p className="text-sm text-muted-foreground">
              Find the perfect talent for your projects
            </p>
          </button>

          {/* Freelancer Role */}
          <button
            onClick={() => setSelectedRole("FREELANCER")}
            className={`relative group flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 ${
              selectedRole === "FREELANCER"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
            }`}
          >
            {selectedRole === "FREELANCER" && (
              <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-primary animate-in zoom-in" />
            )}
            <div
              className={`p-4 rounded-2xl mb-4 transition-colors ${
                selectedRole === "FREELANCER"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <Briefcase className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">I want to work</h2>
            <p className="text-sm text-muted-foreground">
              Discover projects and grow your career
            </p>
          </button>
        </div>

        <Button
          onClick={handleCompleteSignup}
          disabled={!selectedRole || isLoading}
          className="w-full max-w-sm h-14 text-lg font-bold rounded-2xl gradient-hero shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Finalizing...
            </>
          ) : (
            <>
              Continue <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>

        <p className="mt-8 text-sm text-muted-foreground">
          You can always change your details later in settings.
        </p>
      </div>
    </div>
  );
}
