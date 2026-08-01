import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface Profile {
  role: 'empresa' | 'admin'
  empreendimento_id: string | null
}

interface AuthCtx {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, role?: 'empresa' | 'admin') => Promise<string | null>
  signOut: () => Promise<void>
  isAdmin: boolean
  isEmpresa: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('role, empreendimento_id')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s)
      if (s?.user) loadProfile(s.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    if (!supabase) return 'Supabase não configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUp(
    email: string,
    password: string,
    role: 'empresa' | 'admin' = 'empresa',
  ): Promise<string | null> {
    if (!supabase) return 'Supabase não configurado.'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    })
    return error?.message ?? null
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }

  const user = session?.user ?? null

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: profile?.role === 'admin',
        isEmpresa: profile?.role === 'empresa',
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
