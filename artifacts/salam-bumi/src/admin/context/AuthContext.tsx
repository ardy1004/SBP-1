import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AuthUser {
  email: string;
  name: string;
  role: string;
  photo: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = "admin@salambumi.xyz";
const ADMIN_PASSWORD = "salam2026";
const TOKEN_KEY = "sbp_admin_token";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

const ADMIN_USER: AuthUser = {
  email: ADMIN_EMAIL,
  name: "Monica Vera S",
  role: "Admin / Owner",
  photo: "https://images.salambumi.xyz/monic%20sbp.webp",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }, [inactivityTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
    setInactivityTimer(timer);
  }, [inactivityTimer, logout]);

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

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = btoa(JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 }));
      localStorage.setItem(TOKEN_KEY, token);
      setUser(ADMIN_USER);
      resetInactivityTimer();
      return true;
    }
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
