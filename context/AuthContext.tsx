'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut as fbSignOut,
  sendPasswordResetEmail, User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import type { Profile } from '@/lib/firebase'

interface AuthCtx {
  user: User | null; profile: Profile | null; loading: boolean
  signOut: () => Promise<void>
}
const Ctx = createContext<AuthCtx>({ user: null, profile: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref = doc(db, COLLECTIONS.PROFILES, u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) setProfile({ id: u.uid, ...snap.data() } as Profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signOut = async () => { await fbSignOut(auth); setUser(null); setProfile(null) }

  return <Ctx.Provider value={{ user, profile, loading, signOut }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
