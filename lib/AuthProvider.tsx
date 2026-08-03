"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { isAdminUser, type AppUser } from "@/lib/auth-credentials";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  accessToken: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(user: User | null): AppUser | null {
  if (!user?.email) return null;
  return { email: user.email, id: user.id };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        const supabaseUser = session?.user ?? null;
        setUser(toAppUser(supabaseUser));
        setIsAdmin(isAdminUser(supabaseUser));
        setAccessToken(session?.access_token ?? null);
      } catch {
        if (!cancelled) {
          setUser(null);
          setIsAdmin(false);
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const supabaseUser = session?.user ?? null;
      setUser(toAppUser(supabaseUser));
      setIsAdmin(isAdminUser(supabaseUser));
      setAccessToken(session?.access_token ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin, loading, accessToken, signOut }),
    [user, isAdmin, loading, accessToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden.");
  }
  return context;
}
