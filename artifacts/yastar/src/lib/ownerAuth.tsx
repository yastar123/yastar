import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface OwnerSession {
  authenticated: boolean;
  accountId: number | null;
  email?: string;
  businessName?: string;
}

interface OwnerAuthContextType {
  session: OwnerSession | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | null>(null);

export function OwnerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<OwnerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/owner/session`);
      const data: OwnerSession = await res.json();
      setSession(data);
    } catch {
      setSession({ authenticated: false, accountId: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email: string) => {
    const res = await fetch(`${BASE}/api/owner/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Login gagal");
    }
    const data: OwnerSession = await res.json();
    setSession(data);
  };

  const logout = async () => {
    await fetch(`${BASE}/api/owner/logout`, { method: "POST" });
    setSession({ authenticated: false, accountId: null });
  };

  return (
    <OwnerAuthContext.Provider
      value={{ session, isLoading, login, logout, refetch: fetchSession }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) throw new Error("useOwnerAuth must be used inside OwnerAuthProvider");
  return ctx;
}
