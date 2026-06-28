'use client'
import { useState, useEffect, useCallback } from 'react'
import { addDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'

interface Loan { id:string; amount:number; repaid_amount:number; interest_rate:number; duration_months:number; purpose:string; status:string; due_date:string|null; created_at:string }

export default function Loans() {
  const { user } = useAuth()
  const [loans, setLoans]   = useState<Loan[]>([])
  const [credit, setCredit] = useState<{ score:number; grade:string; max_loan_ugx:number }|null>(null)
  const [showApply, setShowApply] = useState(false)
  const [form, setForm]     = useState({ amount:'', purpose:'', months:'6' })
  const [step, setStep]     = useState<'form'|'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const fmt = (n:number) => `UGX ${n.toLocaleString()}`

  const load = useCallback(async () => {
    if (!user?.uid) return
    const [lSnap, cSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.LOANS), where('farmer_id','==',user.uid), orderBy('created_at','desc'))),
      getDocs(query(collection(db, COLLECTIONS.CREDIT_SCORES), where('farmer_id','==',user.uid), orderBy('calculated_at','desc'), limit(1))),
    ])
    setLoans(lSnap.docs.map(d=>({id:d.id,...d.data()} as Loan)))
    if (!cSnap.empty) setCredit(cSnap.docs[0].data() as typeof credit)
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleApply() {
    setLoading(true); setError('')
    const amt = parseFloat(form.amount)
    if (!form.purpose || isNaN(amt) || amt<=0) { setError('Fill all fields'); setLoading(false); return }
    if (credit && amt > credit.max_loan_ugx) { setError(`Max loan is ${fmt(credit.max_loan_ugx)}`); setLoading(false); return }
    await addDoc(collection(db, COLLECTIONS.LOANS), {
      farmer_id: user!.uid, amount: amt, repaid_amount: 0, purpose: form.purpose,
      duration_months: parseInt(form.months), status: 'pending',
      interest_rate: 12, credit_score_at_application: credit?.score || 0,
      created_at: new Date().toISOString(),
    })
    setStep('success'); await load(); setLoading(false)
  }

  const active = loans.filter(l=>l.status==='active')
  const pending = loans.filter(l=>l.status==='pending')
  const past = loans.filter(l=>!['active','pending'].includes(l.status))
  const statusColor: Record<string,string> = { active:'#16a34a', pending:'#d97706', repaid:'#6b7280', rejected:'#dc2626', approved:'#2563eb' }

  return (
    <div style={{ padding:16 }}>
      <h2 style={{ margin:'0 0 16px', fontSize:22, fontWeight:800 }}>🤝 Loans</h2>
      {credit && (
        <div className="card" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', border:`3px solid ${credit.score>=70?'#16a34a':credit.score>=50?'#d97706':'#dc2626'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:18, fontWeight:800, color:credit.score>=70?'#16a34a':credit.score>=50?'#d97706':'#dc2626' }}>{credit.score}</span>
          </div>
          <div>
            <p style={{ margin:0, fontWeight:700 }}>Credit Grade: {credit.grade}</p>
            <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>Max loan: {fmt(credit.max_loan_ugx)}</p>
          </div>
        </div>
      )}
      {active.map(loan => {
        const remaining = loan.amount - loan.repaid_amount
        const pct = (loan.repaid_amount/loan.amount)*100
        return (
          <div key={loan.id} style={{ background:'linear-gradient(135deg,#1e40af,#2563eb)', borderRadius:20, padding:20, marginBottom:16, color:'white' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, opacity:0.8 }}>Active Loan</span>
              <span style={{ background:'#fbbf24', color:'#78350f', borderRadius:999, padding:'2px 10px', fontSize:12, fontWeight:700 }}>ACTIVE</span>
            </div>
            <h2 style={{ margin:'0 0 4px', fontSize:28, fontWeight:800 }}>{fmt(remaining)}</h2>
            <p style={{ margin:'0 0 16px', opacity:0.7, fontSize:13 }}>Remaining from {fmt(loan.amount)}</p>
            <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:999, height:8, marginBottom:8 }}>
              <div style={{ background:'#4ade80', borderRadius:999, height:8, width:`${pct}%` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.8 }}>
              <span>Repaid: {fmt(loan.repaid_amount)}</span><span>{Math.round(pct)}% paid</span>
            </div>
          </div>
        )
      })}
      {pending.map(l => (
        <div key={l.id} className="card" style={{ marginBottom:12, border:'2px solid #fcd34d', background:'#fffbeb' }}>
          <p style={{ margin:'0 0 4px', fontWeight:700, color:'#92400e' }}>⏳ Pending Approval</p>
          <p style={{ margin:0, fontSize:15, fontWeight:600 }}>{fmt(l.amount)}</p>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6b7280' }}>{l.purpose}</p>
        </div>
      ))}
      {!showApply ? (
        <button onClick={() => { setShowApply(true); setStep('form') }}
          style={{ width:'100%', background:'#1a6b3a', color:'white', border:'none', borderRadius:16, padding:16, fontWeight:700, fontSize:18, cursor:'pointer', marginBottom:16 }}>
          ➕ Apply for Loan
        </button>
      ) : step==='success' ? (
        <div style={{ background:'#dcfce7', borderRadius:16, padding:24, textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:48 }}>✅</div>
          <h3 style={{ margin:0, color:'#16a34a' }}>Application Submitted!</h3>
          <p style={{ color:'#374151', fontSize:14 }}>Under review — you will be notified within 24-48 hours.</p>
          <button onClick={() => { setShowApply(false); setStep('form'); setForm({amount:'',purpose:'',months:'6'}) }}
            style={{ background:'#1a6b3a', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', marginTop:8 }}>Done</button>
        </div>
      ) : (
        <div className="card" style={{ marginBottom:16 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:18, fontWeight:800 }}>New Loan Application</h3>
          {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:10, marginBottom:12, fontSize:14 }}>{error}</div>}
          <input type="number" placeholder="Loan amount (UGX)" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
            style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', marginBottom:12 }} />
          <textarea placeholder="Purpose (e.g. Buy fertilizer)" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} rows={3}
            style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', marginBottom:12, resize:'none' }} />
          <select value={form.months} onChange={e=>setForm(f=>({...f,months:e.target.value}))}
            style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', marginBottom:16 }}>
            {[3,6,9,12,18,24].map(m=><option key={m} value={m}>{m} months</option>)}
          </select>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button onClick={() => { setShowApply(false); setError('') }} style={{ background:'white', color:'#374151', border:'2px solid #e5e7eb', borderRadius:12, padding:'14px', fontWeight:700, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleApply} disabled={loading} style={{ background:'#1a6b3a', color:'white', border:'none', borderRadius:12, padding:'14px', fontWeight:700, cursor:'pointer', opacity:loading?0.7:1 }}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
      {past.length>0 && (
        <>
          <h3 style={{ margin:'8px 0 12px', fontSize:17, fontWeight:700 }}>Past Loans</h3>
          {past.map(l => (
            <div key={l.id} className="card" style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div><p style={{ margin:0, fontWeight:700 }}>{fmt(l.amount)}</p><p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{l.purpose?.slice(0,40)}</p></div>
              <span style={{ background:statusColor[l.status]+'22', color:statusColor[l.status], borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700, textTransform:'capitalize' }}>{l.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
