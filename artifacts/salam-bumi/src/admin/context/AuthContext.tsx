import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import bcrypt from "bcryptjs";
import { logActivity } from "../utils/activityLog";
import { authApi, setToken, clearToken, getToken } from "@/lib/api-client";
import type { AdminUser } from "@/lib/api-client";

interface AuthUser {
  email: string;
  name: string;
  role: string;
  photo: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Config dari environment
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string) || "admin@salambumi.xyz";
const ADMIN_PASSWORD_HASH = (import.meta.env.VITE_ADMIN_PASSWORD_HASH as string) ||
  "$2b$12$4z2VBsElVjYj1MXfnWU0zeIWCSXh6epu2ScXH4ABfLm.MACnznWAW";

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

// ---------------------------------------------------------------------------
// Local token helpers (untuk fallback development tanpa backend)
// ---------------------------------------------------------------------------

function generateLocalToken(email: string, duration: number, rememberMe: boolean): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const randomHex = Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
  const payload = {
    sub: email,
    exp: Date.now() + duration,
    iat: Date.now(),
    remember: rememberMe,
    jti: randomHex.slice(0, 16),
    local: true, // Mark sebagai local token
  };
  const payloadB64 = btoa(JSON.stringify(payload));
  return `${payloadB64}.${randomHex}`;
}

function validateLocalToken(token: string): { valid: boolean; email?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };
    const payload = JSON.parse(atob(parts[0]));
    if (!payload.sub || !payload.exp || !payload.local) return { valid: false };
    if (payload.exp <= Date.now()) return { valid: false };
    if (payload.sub !== ADMIN_EMAIL) return { valid: false };
    return { valid: true, email: payload.sub };
  } catch {
    return { valid: false };
  }
}

// ---------------------------------------------------------------------------
// Auth Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }, [inactivityTimer]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    clearTimer();
    logActivity("Logout", "Admin logged out");
    window.location.href = "/admin/login";
  }, [clearTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      logActivity("Auto Logout", "Session expired due to inactivity");
      clearToken();
      setUser(null);
      window.location.href = "/admin/login";
    }, INACTIVITY_TIMEOUT);
    setInactivityTimer(timer);
  }, [inactivityTimer]);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Coba verifikasi via API dulu
      try {
        const result = await authApi.verify();
        if (result.valid && result.admin) {
          setUser({
            email: result.admin.email,
            name: result.admin.name,
            role: result.admin.role,
            photo: result.admin.photo || ADMIN_USER.photo,
          });
          resetInactivityTimer();
          setIsLoading(false);
          return;
        }
      } catch {
        // API tidak tersedia, fallback ke local validation
      }

      // Fallback: local token validation
      const localResult = validateLocalToken(token);
      if (localResult.valid) {
        setUser(ADMIN_USER);
        resetInactivityTimer();
      } else {
        clearToken();
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    // Coba login via API dulu
    try {
      const result = await authApi.login(email, password);
      if (result.success && result.token) {
        setToken(result.token);
        setUser({
          email: result.admin.email,
          name: result.admin.name,
          role: result.admin.role,
          photo: result.admin.photo || ADMIN_USER.photo,
        });
        resetInactivityTimer();
        logActivity("Login", `Admin login berhasil: ${email}`);
        return true;
      }
    } catch (apiError: unknown) {
      // API error - cek apakah connection error atau auth error
      const errorMsg = apiError instanceof Error ? apiError.message : "";
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
        // Backend tidak tersedia, fallback ke local auth
        console.warn("API tidak tersedia, menggunakan local auth");
      } else {
        // Auth error dari API (wrong credentials, dll)
        logActivity("Login Failed", `Percobaan login gagal: ${email}`);
        return false;
      }
    }

    // Fallback: local auth dengan bcrypt
    await new Promise(r => setTimeout(r, 700));

    const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    let passOk = false;
    try {
      passOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } catch {
      passOk = false;
    }

    if (emailOk && passOk) {
      const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      const token = generateLocalToken(ADMIN_EMAIL, duration, rememberMe);
      setToken(token);
      setUser(ADMIN_USER);
      resetInactivityTimer();
      logActivity("Login", `Admin login berhasil (local): ${email}`);
      return true;
    }

    logActivity("Login Failed", `Percobaan login gagal: ${email}`);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
