import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { setAccessToken } from "@/lib/api";
import { api } from "@/lib/api";

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {} = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const roleParam = searchParams.get("role");

    if (!token) {
      navigate("/login?error=google_failed");
      return;
    }

    // Store access token in memory
    setAccessToken(token);

    // Fetch full user data using the token
    const loadUser = async () => {
      try {
        // Use refresh to properly set user in AuthContext
        const response = await api.post("/auth/refresh");
        const { user } = response.data.data;

        // If user has no role, redirect to role selection
        if (!user.role) {
          navigate("/select-role");
          return;
        }

        // Redirect based on role
        switch (user.role) {
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
      } catch {
        navigate("/login?error=google_failed");
      }
    };

    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}
