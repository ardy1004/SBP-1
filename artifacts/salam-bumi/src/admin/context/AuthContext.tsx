import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as bcryptModule from "bcryptjs";
import { logActivity } from "../utils/activityLog";

const bcrypt = (bcryptModule as any).default ?? bcryptModule;

interface AuthUser {
  email: string;
  name: string;
  role: string;
  photo: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string) || "admin@salambumi.xyz";
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH as string | undefined;
const FALLBACK_PASSWORD = "salam2026";

const TOKEN_KEY = "sbp_admin_token";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000;
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const ADMIN_USER: AuthUser = {
  email: ADMIN_EMAIL,
  name: "Monica Vera S",
  role: "Admin / Owner",
  photo: "https://images.salambumi.xyz/monic%20sbp.webp",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }, [inactivityTimer]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    clearTimer();
    logActivity("Logout", "Admin logged out");
    window.location.href = "/admin/login";
  }, [clearTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      logActivity("Auto Logout", "Session expired due to inactivity");
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      window.location.href = "/admin/login";
    }, INACTIVITY_TIMEOUT);
    setInactivityTimer(timer);
  }, [inactivityTimer]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const parsed = JSON.parse(atob(token));
        if (parsed.exp > Date.now()) {
          setUser(ADMIN_USER);
          resetInactivityTimer();
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 700));

    const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!emailMatch) {
      logActivity("Login Failed", `Email tidak sesuai: ${email}`);
      return false;
    }

    let passwordMatch = false;

    // Try bcrypt comparison if hash is available and valid
    if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH.startsWith("$2")) {
      try {
        passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      } catch {
        // bcrypt failed, fall through to fallback
        passwordMatch = false;
      }
    }

    // Fallback: direct comparison with fallback password
    if (!passwordMatch) {
      passwordMatch = password === FALLBACK_PASSWORD;
    }

    if (emailMatch && passwordMatch) {
      const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      const token = btoa(JSON.stringify({
        email,
        exp: Date.now() + duration,
        rememberMe,
      }));
      localStorage.setItem(TOKEN_KEY, token);
      setUser(ADMIN_USER);
      resetInactivityTimer();
      logActivity("Login", `Admin login berhasil: ${email}`);
      return true;
    }

    logActivity("Login Failed", `Password salah untuk: ${email}`);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
