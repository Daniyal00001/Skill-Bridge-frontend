import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, setAccessToken, clearAccessToken } from "@/lib/api";
import {
  signupAPI,
  verifyOtpAPI,
  resendOtpAPI,
  loginAPI,
  logoutAPI,
  AuthUser,
  SignupPayload,
  LoginPayload,
} from "@/lib/auth.service";

// ── Context Shape ─────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (payload: SignupPayload) => Promise<number | undefined>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthUser>; // ← returns AuthUser now
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on page refresh ──────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        const { accessToken, user } = response.data.data;

        setAccessToken(accessToken);
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Signup ────────────────────────────────────────────────
  const signup = async (payload: SignupPayload): Promise<number | undefined> => {
    const response = await signupAPI(payload);
    return response.data?.remainingCooldown;
  };

  // ── Verify OTP ─────────────────────────────────────────────
  const verifyOtp = async (email: string, otp: string) => {
    const response = await verifyOtpAPI(email, otp);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  // ── Resend OTP ─────────────────────────────────────────────
  const resendOtp = async (email: string) => {
    await resendOtpAPI(email);
  };

  // ── Login ─────────────────────────────────────────────────────
  const login = async (payload: LoginPayload) => {
    const response = await loginAPI(payload);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user; // ← ADD THIS LINE — returns user to LoginPage
  };
  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutAPI();
    } catch {
      // even if request fails, clear frontend state
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  // ── Refresh User ──────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken, user } = response.data.data;
      setAccessToken(accessToken);
      setUser(user);
    } catch {
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        verifyOtp,
        resendOtp,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
