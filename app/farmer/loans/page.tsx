'use client'
import { useState } from 'react'

const LOANS = [
  { id: '1', amount: 500000, repaid: 300000, interest_rate: 12, due_date: '2026-07-15', status: 'active', purpose: 'Buying fertilizer for maize crop' },
]

export default function Loans() {
  const [showApply, setShowApply] = useState(false)
  const [form, setForm] = useState({ amount: '', purpose: '', months: '6' })
  const [step, setStep] = useState<'form'|'review'|'success'>('form')

  const loan = LOANS[0]
  const remaining = loan.amount - loan.repaid
  const progress = (loan.repaid / loan.amount) * 100
  const monthlyPayment = Math.ceil(remaining / 3)

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800 }}>🤝 Loans</h2>

      {/* Active Loan */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', borderRadius: 20, padding: 20, marginBottom: 16, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Active Loan</span>
          <span style={{ background: '#fbbf24', color: '#78350f', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>ACTIVE</span>
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800 }}>UGX {remaining.toLocaleString()}</h2>
        <p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 13 }}>Remaining from UGX {loan.amount.toLocaleString()}</p>
        
        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 8, marginBottom: 8 }}>
          <div style={{ background: '#4ade80', borderRadius: 999, height: 8, width: `${progress}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.8 }}>
          <span>Repaid: UGX {loan.repaid.toLocaleString()}</span>
          <span>{Math.round(progress)}% paid</span>
        </div>
      </div>

      {/* Loan Details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 12px', color: '#374151' }}>Loan Details</h4>
        {[
          { label: 'Purpose', value: loan.purpose, icon: '📋' },
          { label: 'Interest Rate', value: `${loan.interest_rate}% per year`, icon: '📊' },
          { label: 'Due Date', value: loan.due_date, icon: '📅' },
          { label: 'Monthly Payment', value: `UGX ${monthlyPayment.toLocaleString()}`, icon: '💳' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{item.icon} {item.label}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Repay Button */}
      <button style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 12 }}>
        💳 Make Repayment
      </button>

      {/* Credit Score Note */}
      <div className="card" style={{ marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>🌟 Repay early = Higher credit score</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1e40af' }}>Early repayment boosts your score and unlocks bigger loans next time.</p>
      </div>

      {/* Apply New Loan */}
      <button onClick={() => setShowApply(true)}
        style={{ width: '100%', background: '#f3f4f6', color: '#374151', border: '2px dashed #d1d5db', borderRadius: 16, padding: '16px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
        ➕ Apply for New Loan
      </button>

      {/* Apply Modal */}
      {showApply && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            {step === 'form' && (
              <>
                <h3 style={{ margin: '0 0 4px' }}>🤝 Apply for Loan</h3>
                <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 13 }}>Maximum eligible: UGX 3,000,000 (Credit Grade B)</p>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount (UGX)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="e.g. 300000" max="3000000"
                    style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 18, fontWeight: 700, outline: 'none' }} />
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Purpose</label>
                  <select value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})}
                    style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 16, outline: 'none', background: 'white' }}>
                    <option value="">Select purpose...</option>
                    <option>Buying seeds and fertilizer</option>
                    <option>Buying farm equipment</option>
                    <option>School fees</option>
                    <option>Medical emergency</option>
                    <option>Building/housing</option>
                    <option>Other farming inputs</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Repayment Period</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['3', '6', '12'].map(m => (
                      <button key={m} onClick={() => setForm({...form, months: m})}
                        style={{ background: form.months === m ? '#1a6b3a' : '#f3f4f6', color: form.months === m ? 'white' : '#374151', border: 'none', borderRadius: 12, padding: '12px 8px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                        {m} months
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => setShowApply(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: 14, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setStep('review')} disabled={!form.amount || !form.purpose}
                    style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: !form.amount || !form.purpose ? 0.5 : 1 }}>
                    Review →
                  </button>
                </div>
              </>
            )}
            
            {step === 'review' && (
              <>
                <h3 style={{ margin: '0 0 16px' }}>📋 Review Loan Application</h3>
                {[
                  { label: 'Loan Amount', value: `UGX ${Number(form.amount).toLocaleString()}` },
                  { label: 'Purpose', value: form.purpose },
                  { label: 'Duration', value: `${form.months} months` },
                  { label: 'Interest Rate', value: '12% per annum' },
                  { label: 'Monthly Payment', value: `UGX ${Math.ceil(Number(form.amount) * 1.12 / Number(form.months)).toLocaleString()}` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>Application will be reviewed by SACCO admin within 24-48 hours.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <button onClick={() => setStep('form')} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: 14, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>← Back</button>
                  <button onClick={() => setStep('success')} style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Submit ✓</button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h3 style={{ margin: '0 0 8px' }}>Application Submitted!</h3>
                <p style={{ color: '#6b7280', marginBottom: 24 }}>Your loan application for UGX {Number(form.amount).toLocaleString()} has been submitted. SACCO admin will review within 24-48 hours.</p>
                <button onClick={() => { setShowApply(false); setStep('form') }}
                  style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
