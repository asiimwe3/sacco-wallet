import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export const storage = getStorage(app)

// ─── Firestore collection names ───────────────────────────────
export const COLLECTIONS = {
  PROFILES:      'profiles',
  WALLETS:       'wallets',
  FARM_RECORDS:  'farm_records',
  SAVINGS_TXNS:  'savings_transactions',
  LOANS:         'loans',
  REPAYMENTS:    'loan_repayments',
  CREDIT_SCORES: 'credit_scores',
  MARKET_PRICES: 'market_prices',
  MARKETPLACE:   'marketplace_listings',
  OFFLINE_SYNC:  'offline_sync_log',
}

export type UserRole   = 'farmer' | 'admin' | 'field_officer'
export type LoanStatus = 'pending' | 'approved' | 'active' | 'repaid' | 'defaulted' | 'rejected'
export type Language   = 'runyoro' | 'luganda' | 'english'

export interface Profile {
  id: string; phone_number: string; full_name: string; role: UserRole
  preferred_language: Language; village: string; district: string
  is_active: boolean; joined_sacco_at: string; created_at: string
}
export interface Wallet {
  id: string; user_id: string; savings_balance: number; balance: number; shares_owned: number
}
