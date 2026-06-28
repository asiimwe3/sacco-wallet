import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: { params: { eventsPerSecond: 2 } },
})

// ─── Types matching the DB schema ───────────────────────────

export type UserRole = 'farmer' | 'admin' | 'field_officer'
export type LoanStatus = 'pending' | 'approved' | 'active' | 'repaid' | 'defaulted' | 'rejected'
export type TransactionType = 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'interest' | 'fee' | 'share_purchase'
export type Language = 'runyoro' | 'luganda' | 'english'

export interface Profile {
  id: string
  phone_number?: string
  full_name: string
  role: UserRole
  preferred_language: Language
  village?: string
  district?: string
  is_active: boolean
  joined_sacco_at: string
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  savings_balance: number
  shares_owned: number
  locked_amount: number
  currency: string
  last_txn_at?: string
}

export interface FarmRecord {
  id: string
  farmer_id: string
  farm_size_acres?: number
  crops: string[]
  gps_lat?: number
  gps_lng?: number
  has_consented_to_gps: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
}

export interface SavingsTransaction {
  id: string
  wallet_id: string
  farmer_id: string
  type: TransactionType
  amount: number
  balance_after: number
  reference_id?: string
  note?: string
  synced_from_offline: boolean
  created_at: string
}

export interface Loan {
  id: string
  farmer_id: string
  amount: number
  interest_rate: number
  duration_months: number
  purpose: string
  status: LoanStatus
  repaid_amount: number
  due_date?: string
  disbursed_at?: string
  credit_score_at_application?: number
  created_at: string
}

export interface CreditScore {
  id: string
  farmer_id: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  max_loan_ugx: number
  calculated_at: string
}

export interface MarketPrice {
  id: string
  crop: string
  crop_runyoro?: string
  crop_luganda?: string
  price_per_kg: number
  market_name: string
  price_date: string
}

// ─── Auth helpers ─────────────────────────────────────────

export async function signUpFarmer(params: {
  phone: string
  password: string
  full_name: string
  preferred_language: Language
  village: string
  district: string
}) {
  const { data, error } = await supabase.auth.signUp({
    phone: params.phone,
    password: params.password,
    options: {
      data: {
        full_name: params.full_name,
        role: 'farmer',
        preferred_language: params.preferred_language,
        village: params.village,
        district: params.district,
        phone: params.phone,
      }
    }
  })
  return { data, error }
}

export async function signInFarmer(phone: string, password: string) {
  return supabase.auth.signInWithPassword({ phone, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

// ─── RPC wrappers ─────────────────────────────────────────

export async function getFarmerDashboard(farmerId: string) {
  return supabase.rpc('get_farmer_dashboard', { p_farmer_id: farmerId })
}

export async function syncOfflineTransaction(params: {
  farmer_id: string
  type: TransactionType
  amount: number
  reference_id: string
  note?: string
  device_info?: string
}) {
  return supabase.rpc('sync_offline_transaction', {
    p_farmer_id: params.farmer_id,
    p_type: params.type,
    p_amount: params.amount,
    p_reference_id: params.reference_id,
    p_note: params.note,
    p_device_info: params.device_info,
  })
}

export async function recalculateCreditScore(farmerId: string) {
  return supabase.rpc('recalculate_credit_score', { p_farmer_id: farmerId })
}

export async function getMarketPrices() {
  return supabase.from('market_prices').select('*').order('price_date', { ascending: false })
}
