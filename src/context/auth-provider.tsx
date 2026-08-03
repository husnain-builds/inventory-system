"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  getSession,
  setSession,
  signIn as authSignIn,
  signUp as authSignUp,
  type User,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => void;
  updateUserProfile: (patch: { name?: string; department?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setIsLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = authSignIn(email, password);
      if ("error" in result) return { error: result.error };
      setUser(result.user);
      router.push("/");
      return {};
    },
    [router]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const result = authSignUp(name, email, password);
      if ("error" in result) return { error: result.error };
      setUser(result.user);
      router.push("/");
      return {};
    },
    [router]
  );

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/sign-in");
  }, [router]);

  const updateUserProfile = useCallback(
    (patch: { name?: string; department?: string }) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        setSession(next);
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut, updateUserProfile }),
    [user, isLoading, signIn, signUp, signOut, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
