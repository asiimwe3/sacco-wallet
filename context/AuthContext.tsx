'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string; full_name: string; phone_number: string|null
  role: string; preferred_language: string; village: string|null
  district: string|null; is_active: boolean
}

interface AuthCtx {
  user: User|null; profile: Profile|null; session: Session|null
  loading: boolean; signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({ user:null, profile:null, session:null, loading:true, signOut:async()=>{} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User|null>(null)
  const [profile, setProfile] = useState<Profile|null>(null)
  const [session, setSession] = useState<Session|null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); setSession(null) }

  return <Ctx.Provider value={{ user, profile, session, loading, signOut }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
