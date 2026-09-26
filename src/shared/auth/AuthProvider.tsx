"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentCustomer } from "@/src/shared/api/auth.api";
import { ApiError, logoutRequest, markSessionHealthy } from "@/src/shared/api/http";
import type { Customer } from "@/src/shared/types/auth";

type AuthContextValue = {
  user: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<Customer | null>;
  logout: () => Promise<void>;
  setAuthenticatedUser: (user: Customer | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentCustomer();
      setUser(response.user);
      markSessionHealthy();
      return response.user;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setUser(null);
        return null;
      }

      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const current = await refreshUser();
        if (!active && current) return;
      } catch {
        // Keep the public app usable if the backend is temporarily unavailable.
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("repairflow-session-expired", handleSessionExpired);
    return () => window.removeEventListener("repairflow-session-expired", handleSessionExpired);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshUser,
      logout,
      setAuthenticatedUser: setUser,
    }),
    [isLoading, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
