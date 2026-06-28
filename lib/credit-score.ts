// Simple rule-based credit scoring — transparent and explainable

export interface CreditFactors {
  savings_months: number          // how many months consistently saved
  savings_total: number           // total UGX saved
  loans_taken: number             // total loans taken
  loans_repaid_on_time: number    // repaid on/before due date
  loans_defaulted: number         // defaulted loans
  farm_size_acres: number         // self-reported
  gps_verified: boolean           // GPS verification done
  member_months: number           // months as SACCO member
}

export interface CreditResult {
  score: number          // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  max_loan_ugx: number
  breakdown: { factor: string; points: number; max: number; explanation: string }[]
}

export function calculateCreditScore(f: CreditFactors): CreditResult {
  const breakdown = []

  // 1. Savings consistency (30 pts)
  const savingsPoints = Math.min(30, Math.round((f.savings_months / 12) * 20 + (f.savings_total > 100000 ? 10 : f.savings_total / 10000)))
  breakdown.push({ factor: 'Savings Consistency', points: savingsPoints, max: 30, explanation: `${f.savings_months} months of saving, UGX ${f.savings_total.toLocaleString()} total` })

  // 2. Loan repayment history (35 pts)
  let repayPoints = 0
  if (f.loans_taken > 0) {
    const repayRate = f.loans_repaid_on_time / f.loans_taken
    repayPoints = Math.round(repayRate * 30)
    if (f.loans_defaulted > 0) repayPoints -= f.loans_defaulted * 8
    repayPoints = Math.max(0, Math.min(35, repayPoints))
  } else {
    repayPoints = 15 // no history = neutral
  }
  breakdown.push({ factor: 'Loan Repayment', points: repayPoints, max: 35, explanation: `${f.loans_repaid_on_time}/${f.loans_taken} loans repaid on time` })

  // 3. Farm size (20 pts)
  let farmPoints = Math.min(15, Math.round(f.farm_size_acres * 2))
  if (f.gps_verified) farmPoints += 5
  breakdown.push({ factor: 'Farm Size & Verification', points: farmPoints, max: 20, explanation: `${f.farm_size_acres} acres${f.gps_verified ? ' (GPS verified)' : ' (self-reported)'}` })

  // 4. Membership duration (15 pts)
  const memberPoints = Math.min(15, Math.round((f.member_months / 24) * 15))
  breakdown.push({ factor: 'SACCO Membership', points: memberPoints, max: 15, explanation: `${f.member_months} months as member` })

  const score = Math.min(100, breakdown.reduce((s, b) => s + b.points, 0))
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F'
  const max_loan_ugx = score >= 80 ? 5000000 : score >= 65 ? 3000000 : score >= 50 ? 1500000 : score >= 35 ? 500000 : 0

  return { score, grade, max_loan_ugx, breakdown }
}
