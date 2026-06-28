import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  if (getApps().length) return getApps()[0]
  return initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) })
}

export async function POST(req: NextRequest) {
  const { farmer_id } = await req.json()
  if (!farmer_id) return NextResponse.json({ error:'Missing farmer_id' }, { status:400 })
  const app = getAdmin()
  const db = getFirestore(app)

  const [walletSnap, loansSnap, txnsSnap] = await Promise.all([
    db.collection('wallets').doc(farmer_id).get(),
    db.collection('loans').where('farmer_id','==',farmer_id).get(),
    db.collection('savings_transactions').where('farmer_id','==',farmer_id).where('type','==','deposit').get(),
  ])

  let score = 0; const factors: Record<string,number> = {}
  const savBal = walletSnap.data()?.savings_balance || 0
  const savScore = Math.min(Math.floor(savBal/50000), 30)
  score += savScore; factors.savings_balance = savScore

  const loans = loansSnap.docs.map(d=>d.data())
  const repaid = loans.filter(l=>l.status==='repaid').length
  const defaulted = loans.filter(l=>l.status==='defaulted').length
  const repayScore = Math.max(Math.min(repaid*15,40) - defaulted*20, 0)
  score += repayScore; factors.repayment = repayScore

  const monthSet = new Set(txnsSnap.docs.map(d=>d.data().created_at?.slice(0,7)).filter(Boolean))
  const regScore = Math.min(monthSet.size*2, 20)
  score += regScore; factors.regularity = regScore

  const shareScore = Math.min(walletSnap.data()?.shares_owned||0, 10)
  score += shareScore; factors.shares = shareScore

  score = Math.max(0, Math.min(100, score))
  const grade = score>=80?'A':score>=65?'B':score>=50?'C':score>=35?'D':'F'
  const maxLoan = score>=80?3000000:score>=65?2000000:score>=50?1000000:score>=35?500000:200000

  await db.collection('credit_scores').add({ farmer_id, score, grade, max_loan_ugx:maxLoan, factors, calculated_at: new Date().toISOString() })
  return NextResponse.json({ score, grade, max_loan_ugx:maxLoan, factors })
}
