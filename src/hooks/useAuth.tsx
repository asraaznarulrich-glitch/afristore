import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const Ctx = createContext<{ user: User | null; loading: boolean; isAdmin: boolean }>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) return setIsAdmin(false);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);
  return <Ctx.Provider value={{ user, loading, isAdmin }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export function displayName(user: User) {
  return (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Utilisateur") as string;
}
