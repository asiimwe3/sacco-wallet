'use client'
import { useState } from 'react'

const TRANSACTIONS = [
  { id: '1', type: 'deposit', amount: 50000, note: 'Monthly savings', date: '2026-06-25' },
  { id: '2', type: 'deposit', amount: 25000, note: 'Coffee harvest proceeds', date: '2026-06-15' },
  { id: '3', type: 'withdrawal', amount: 10000, note: 'Emergency withdrawal', date: '2026-06-10' },
  { id: '4', type: 'deposit', amount: 50000, note: 'Monthly savings', date: '2026-05-25' },
  { id: '5', type: 'deposit', amount: 30000, note: 'Maize sale', date: '2026-05-12' },
]

export default function Savings() {
  const [showModal, setShowModal] = useState<'deposit'|'withdraw'|null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)

  const balance = 485000

  const handleSubmit = () => {
    setSuccess(true)
    setShowModal(null)
    setAmount('')
    setNote('')
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>💰 Savings</h2>

      {success && (
        <div style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 12, padding: 12, marginBottom: 16, fontWeight: 600 }}>
          ✅ Transaction recorded! Will sync when online.
        </div>
      )}

      {/* Balance Card */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 24, marginBottom: 20, color: 'white', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>Total Savings Balance</p>
        <h1 style={{ margin: '8px 0', fontSize: 36, fontWeight: 800 }}>UGX {balance.toLocaleString()}</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>14 months of consistent saving 🎉</p>
      </div>

      {/* Savings Goal */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Goal: UGX 1,000,000</span>
          <span style={{ color: '#1a6b3a', fontWeight: 700 }}>48.5%</span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: 999, height: 10 }}>
          <div style={{ background: '#1a6b3a', borderRadius: 999, height: 10, width: '48.5%' }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>UGX 515,000 more to reach your goal</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setShowModal('deposit')}
          style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          ⬆️ Deposit
        </button>
        <button onClick={() => setShowModal('withdraw')}
          style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          ⬇️ Withdraw
        </button>
      </div>

      {/* Savings Insight */}
      <div className="card" style={{ marginBottom: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#15803d' }}>💡 Savings Insight</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#166534' }}>You save an average of UGX 34,600/month. At this rate, you'll reach your goal in 15 months.</p>
      </div>

      {/* Transaction History */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Transaction History</h3>
      <div className="card">
        {TRANSACTIONS.map((tx, i) => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < TRANSACTIONS.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{tx.type === 'deposit' ? '⬆️' : '⬇️'}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{tx.type}</p>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>{tx.note} • {tx.date}</p>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: tx.type === 'deposit' ? '#16a34a' : '#dc2626', fontSize: 15 }}>
              {tx.type === 'deposit' ? '+' : '-'}UGX {tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: 24, width: '100%' }}>
            <h3 style={{ margin: '0 0 16px', textTransform: 'capitalize' }}>{showModal === 'deposit' ? '⬆️ Make Deposit' : '⬇️ Withdraw'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount (UGX)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50000"
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 18, fontWeight: 700, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Note (optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Maize sale"
                style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 16, outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setShowModal(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: 14, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!amount} style={{ background: showModal === 'deposit' ? '#1a6b3a' : '#dc2626', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: !amount ? 0.5 : 1 }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
