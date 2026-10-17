import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
interface Profile {
  role: "empresa" | "admin";
  empreendimento_id: string | null;
}
interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isEmpresa: boolean;
}
const Ctx = createContext<AuthCtx | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useRef<string | null>(null);
  const refreshProfile = useCallback(async () => {
    if (!supabase || !currentUser.current) return;
    const id = currentUser.current;
    const { data, error: err } = await supabase
      .from("profiles")
      .select("role,empreendimento_id")
      .eq("id", id)
      .single();
    if (currentUser.current !== id) return;
    setProfile(data as Profile | null);
    setError(
      err
        ? "Não foi possível carregar seu perfil. Atualize a página para tentar novamente."
        : null,
    );
  }, []);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    let revision = 0;
    async function sync(s: Session | null) {
      const token = ++revision;
      if (!active) return;
      currentUser.current = s?.user.id ?? null;
      setSession(s);
      setProfile(null);
      setLoading(true);
      setError(null);
      try {
        if (s?.user) await refreshProfile();
      } finally {
        if (active && token === revision) setLoading(false);
      }
    }
    // Do not await database calls inside the auth callback (can deadlock Auth).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setTimeout(() => {
        if (active) void sync(s);
      }, 0);
    });
    supabase.auth
      .getSession()
      .then(({ data, error: err }) => {
        if (active) {
          if (err) setError(err.message);
          void sync(data.session);
        }
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível restaurar sua sessão.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
      currentUser.current = null;
      listener.subscription.unsubscribe();
    };
  }, [refreshProfile]);
  async function signIn(email: string, password: string) {
    if (!supabase) return "Serviço de acesso indisponível.";
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }
  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    currentUser.current = null;
  }
  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        error,
        signIn,
        signOut,
        refreshProfile,
        isAdmin: profile?.role === "admin",
        isEmpresa: profile?.role === "empresa",
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("AuthProvider ausente");
  return c;
}
