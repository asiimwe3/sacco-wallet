'use client'
import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'

export default function Savings() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<{ id:string; savings_balance:number }|null>(null)
  const [txns, setTxns]     = useState<{ id:string; type:string; amount:number; note:string|null; created_at:string }[]>([])
  const [modal, setModal]   = useState<'deposit'|'withdraw'|null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]   = useState('')
  const fmt = (n:number) => `UGX ${n.toLocaleString()}`

  const load = useCallback(async () => {
    if (!user?.uid) return
    const wSnap = await getDoc(doc(db, COLLECTIONS.WALLETS, user.uid))
    if (wSnap.exists()) setWallet({ id: wSnap.id, ...wSnap.data() } as typeof wallet & { id:string })
    const tSnap = await getDocs(query(collection(db, COLLECTIONS.SAVINGS_TXNS), where('farmer_id','==',user.uid), orderBy('created_at','desc'), limit(30)))
    setTxns(tSnap.docs.map(d => ({ id:d.id, ...d.data() } as typeof txns[0])))
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleTxn() {
    if (!wallet || !user?.uid || !amount) return
    setLoading(true); setError('')
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); setLoading(false); return }
    if (modal==='withdraw' && amt > wallet.savings_balance) { setError('Insufficient balance'); setLoading(false); return }
    const newBal = modal==='deposit' ? wallet.savings_balance + amt : wallet.savings_balance - amt
    const now = new Date().toISOString()
    await addDoc(collection(db, COLLECTIONS.SAVINGS_TXNS), {
      wallet_id: wallet.id, farmer_id: user.uid,
      type: modal==='deposit' ? 'deposit' : 'withdrawal',
      amount: amt, balance_after: newBal, note: note||null, created_at: now,
    })
    await updateDoc(doc(db, COLLECTIONS.WALLETS, user.uid), { savings_balance: newBal, balance: newBal })
    setSuccess(modal==='deposit' ? `✅ Saved ${fmt(amt)}` : `✅ Withdrew ${fmt(amt)}`)
    setModal(null); setAmount(''); setNote(''); await load()
    setTimeout(() => setSuccess(''), 4000)
    setLoading(false)
  }

  const goal = 1000000
  const pct  = wallet ? Math.min((wallet.savings_balance/goal)*100, 100) : 0

  return (
    <div style={{ padding:16 }}>
      <h2 style={{ margin:'0 0 16px', fontSize:22, fontWeight:800 }}>💰 Savings</h2>
      {success && <div style={{ background:'#dcfce7', color:'#16a34a', borderRadius:12, padding:12, marginBottom:16, fontWeight:600 }}>{success}</div>}
      <div style={{ background:'linear-gradient(135deg,#1a6b3a,#2d9e56)', borderRadius:20, padding:24, marginBottom:20, color:'white', textAlign:'center' }}>
        <p style={{ margin:0, fontSize:14, opacity:0.8 }}>Total Savings Balance</p>
        <h1 style={{ margin:'8px 0', fontSize:36, fontWeight:800 }}>{wallet ? fmt(wallet.savings_balance) : '...'}</h1>
      </div>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontWeight:600 }}>Goal: {fmt(goal)}</span>
          <span style={{ color:'#1a6b3a', fontWeight:700 }}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{ background:'#e5e7eb', borderRadius:999, height:10 }}>
          <div style={{ background:'#1a6b3a', borderRadius:999, height:10, width:`${pct}%`, transition:'width 0.5s' }} />
        </div>
        <p style={{ margin:'8px 0 0', fontSize:13, color:'#6b7280' }}>{fmt(Math.max(goal-(wallet?.savings_balance||0),0))} more to reach your goal</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        <button onClick={() => setModal('deposit')} style={{ background:'#1a6b3a', color:'white', border:'none', borderRadius:16, padding:16, fontWeight:700, fontSize:16, cursor:'pointer' }}>⬆️ Deposit</button>
        <button onClick={() => setModal('withdraw')} style={{ background:'white', color:'#1a6b3a', border:'2px solid #1a6b3a', borderRadius:16, padding:16, fontWeight:700, fontSize:16, cursor:'pointer' }}>⬇️ Withdraw</button>
      </div>
      <h3 style={{ margin:'0 0 12px', fontSize:17, fontWeight:700 }}>Transaction History</h3>
      {txns.length===0 && <p style={{ color:'#9ca3af', textAlign:'center', padding:24 }}>No transactions yet</p>}
      {txns.map(t => (
        <div key={t.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:t.type==='deposit'?'#dcfce7':'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {t.type==='deposit'?'⬆️':'⬇️'}
            </div>
            <div>
              <p style={{ margin:0, fontWeight:600, fontSize:14, textTransform:'capitalize' }}>{t.type}</p>
              <p style={{ margin:0, color:'#9ca3af', fontSize:12 }}>{t.note||'No note'} • {t.created_at.slice(0,10)}</p>
            </div>
          </div>
          <span style={{ fontWeight:700, color:t.type==='deposit'?'#16a34a':'#dc2626', fontSize:15 }}>
            {t.type==='deposit'?'+':'-'}{fmt(t.amount)}
          </span>
        </div>
      ))}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'white', borderRadius:'20px 20px 0 0', padding:24, width:'100%' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:20, fontWeight:800 }}>{modal==='deposit'?'⬆️ Deposit Savings':'⬇️ Withdraw'}</h3>
            {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:10, marginBottom:12, fontSize:14 }}>{error}</div>}
            <input type="number" placeholder="Amount (UGX)" value={amount} onChange={e=>setAmount(e.target.value)}
              style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:18, outline:'none', marginBottom:12 }} />
            <input type="text" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)}
              style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', marginBottom:16 }} />
            <button onClick={handleTxn} disabled={loading}
              style={{ width:'100%', background:'#1a6b3a', color:'white', border:'none', borderRadius:16, padding:16, fontWeight:700, fontSize:18, cursor:'pointer', marginBottom:8, opacity:loading?0.7:1 }}>
              {loading ? 'Processing...' : `Confirm ${modal==='deposit'?'Deposit':'Withdrawal'}`}
            </button>
            <button onClick={() => { setModal(null); setError('') }}
              style={{ width:'100%', background:'transparent', color:'#6b7280', border:'none', padding:12, fontSize:16, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
