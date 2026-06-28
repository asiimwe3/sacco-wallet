import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { farmer_id } = await req.json()
  if (!farmer_id) return NextResponse.json({ error: 'Missing farmer_id' }, { status: 400 })

  const [{ data: wallet }, { data: loans }, { data: txns }] = await Promise.all([
    supabase.from('wallets').select('savings_balance,shares_owned').eq('user_id', farmer_id).single(),
    supabase.from('loans').select('status,amount,repaid_amount').eq('farmer_id', farmer_id),
    supabase.from('savings_transactions').select('created_at').eq('farmer_id', farmer_id).eq('type','deposit'),
  ])

  let score = 0
  const factors: Record<string,number> = {}

  // Savings balance (up to 30 pts)
  const savBal = wallet?.savings_balance || 0
  const savScore = Math.min(Math.floor(savBal / 50000), 30)
  score += savScore; factors.savings_balance = savScore

  // Repayment history (up to 40 pts)
  const repaid = loans?.filter(l => l.status === 'repaid').length || 0
  const defaulted = loans?.filter(l => l.status === 'defaulted').length || 0
  const repayScore = Math.min(repaid * 15, 40) - defaulted * 20
  score += Math.max(repayScore, 0); factors.repayment = Math.max(repayScore, 0)

  // Savings regularity (up to 20 pts)
  const monthSet = new Set(txns?.map(t => t.created_at.slice(0,7)) || [])
  const regScore = Math.min(monthSet.size * 2, 20)
  score += regScore; factors.regularity = regScore

  // Shares (up to 10 pts)
  const shareScore = Math.min((wallet?.shares_owned || 0), 10)
  score += shareScore; factors.shares = shareScore

  score = Math.max(0, Math.min(100, score))
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F'
  const maxLoan = score >= 80 ? 3000000 : score >= 65 ? 2000000 : score >= 50 ? 1000000 : score >= 35 ? 500000 : 200000

  // Save to DB
  await supabase.from('credit_scores').insert({ farmer_id, score, grade, max_loan_ugx: maxLoan, factors })

  return NextResponse.json({ score, grade, max_loan_ugx: maxLoan, factors })
}
