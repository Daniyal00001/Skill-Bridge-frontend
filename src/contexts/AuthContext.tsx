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
  signup: (payload: SignupPayload) => Promise<void>;
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
  const signup = async (payload: SignupPayload) => {
    const response = await signupAPI(payload);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  // ── Login ─────────────────────────────────────────────────
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
