// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User, LoginPayload } from "@/types";
import { login as loginRequest, getProfile } from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "kenakata_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    getProfile(stored)
      .then((profile) => {
        setToken(stored);
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const { access_token } = await loginRequest(payload);
    const profile = await getProfile(access_token);
    localStorage.setItem(TOKEN_KEY, access_token);
    // Mirror into a readable cookie so middleware can check auth presence.
    // NOTE (tradeoff, document in README): a plain cookie is readable by JS,
    // which is weaker than an httpOnly cookie set from a route handler.
    // For a one-day capstone this is an accepted, documented tradeoff.
    document.cookie = `access_token=${access_token}; path=/; max-age=86400; samesite=lax`;
    setToken(access_token);
    setUser(profile);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = "access_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, isLoading, login, logout }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}