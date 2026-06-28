'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Stats { farmers:number; activeLoans:number; savings:number; disbursed:number; repaymentRate:number }

export default function AdminDashboard() {
  const { profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab]       = useState<'overview'|'loans'|'farmers'>('overview')
  const [stats, setStats]   = useState<Stats>({ farmers:0, activeLoans:0, savings:0, disbursed:0, repaymentRate:0 })
  const [farmers, setFarmers] = useState<{ id:string; full_name:string; village:string|null; created_at:string }[]>([])
  const [loans, setLoans]   = useState<{ id:string; amount:number; purpose:string; status:string; profiles:{ full_name:string }|null; created_at:string }[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const fmt = (n:number) => `UGX ${n.toLocaleString()}`

  // Auth guard — admin/field_officer only
  useEffect(() => {
    if (!authLoading && profile && !['admin','field_officer'].includes(profile.role)) router.push('/farmer/dashboard')
  }, [authLoading, profile, router])

  useEffect(() => {
    async function load() {
      const [{ data:f },{ data:l },{ data:w }] = await Promise.all([
        supabase.from('profiles').select('id,full_name,village,created_at').eq('role','farmer').order('created_at',{ascending:false}),
        supabase.from('loans').select('id,amount,purpose,status,created_at,profiles(full_name)').order('created_at',{ascending:false}).limit(50),
        supabase.from('wallets').select('savings_balance,balance'),
      ])
      if (f) setFarmers(f)
      if (l) {
        setLoans(l as typeof loans)
        const active = l.filter((x:{ status:string })=>x.status==='active')
        const repaid = l.filter((x:{ status:string })=>x.status==='repaid')
        const rate = l.length > 0 ? ((repaid.length + active.length) / l.length) * 100 : 0
        const totalDisbursed = l.filter((x:{ status:string; amount:number })=>['active','repaid'].includes(x.status)).reduce((s:number,x:{ amount:number })=>s+x.amount, 0)
        if (w) {
          const totalSavings = w.reduce((s:number,x:{ savings_balance:number })=>s+x.savings_balance, 0)
          setStats({ farmers: f?.length || 0, activeLoans: active.length, savings: totalSavings, disbursed: totalDisbursed, repaymentRate: Math.round(rate * 10)/10 })
        }
      }
      setDataLoading(false)
    }
    load()
  }, [])

  async function updateLoanStatus(id: string, status: string) {
    await supabase.from('loans').update({ status }).eq('id', id)
    setLoans(prev => prev.map(l => l.id===id ? { ...l, status } : l))
  }

  if (authLoading || dataLoading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><span style={{ fontSize:40 }}>⏳</span></div>

  const pendingLoans = loans.filter(l => l.status === 'pending')
  const statusColor: Record<string,string> = { pending:'#d97706', active:'#16a34a', approved:'#2563eb', repaid:'#6b7280', rejected:'#dc2626' }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7f2' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'20px 20px 0', color:'white' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800 }}>⚙️ SACCO Admin</h1>
            <p style={{ margin:0, fontSize:13, opacity:0.7 }}>Kyenjojo Farmers SACCO • {profile?.full_name}</p>
          </div>
          <button onClick={async () => { await signOut(); router.push('/') }}
            style={{ color:'rgba(255,255,255,0.7)', fontSize:13, background:'none', border:'none', cursor:'pointer' }}>Logout</button>
        </div>
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.1)', borderRadius:12, padding:4, marginBottom:0 }}>
          {(['overview','loans','farmers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex:1, background: tab===t ? 'white' : 'transparent', color: tab===t ? '#1a1a2e' : 'rgba(255,255,255,0.7)', border:'none', borderRadius:10, padding:'8px 4px', fontWeight:700, fontSize:13, cursor:'pointer', textTransform:'capitalize' }}>
              {t} {t==='loans' && pendingLoans.length > 0 && <span style={{ background:'#ef4444', color:'white', borderRadius:999, padding:'1px 6px', fontSize:11 }}>{pendingLoans.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:16 }}>
        {tab === 'overview' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[
                { l:'Total Farmers', v:stats.farmers, i:'👨‍🌾', c:'#1a6b3a' },
                { l:'Active Loans', v:stats.activeLoans, i:'🤝', c:'#2563eb' },
                { l:'Total Savings', v:fmt(stats.savings), i:'💰', c:'#d97706' },
                { l:'Repayment Rate', v:`${stats.repaymentRate}%`, i:'📊', c:'#7c3aed' },
              ].map(kpi => (
                <div key={kpi.l} className="card" style={{ textAlign:'center' }}>
                  <span style={{ fontSize:28 }}>{kpi.i}</span>
                  <p style={{ margin:'8px 0 2px', fontWeight:800, fontSize:18, color:kpi.c }}>{kpi.v}</p>
                  <p style={{ margin:0, color:'#6b7280', fontSize:12 }}>{kpi.l}</p>
                </div>
              ))}
            </div>
            {pendingLoans.length > 0 && (
              <>
                <h3 style={{ margin:'0 0 12px', fontSize:17, fontWeight:700 }}>⏳ Pending Loan Approvals ({pendingLoans.length})</h3>
                {pendingLoans.map(l => (
                  <div key={l.id} className="card" style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div>
                        <p style={{ margin:0, fontWeight:700 }}>{(l.profiles as {full_name:string}|null)?.full_name || 'Unknown'}</p>
                        <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{l.purpose?.slice(0,50)}</p>
                      </div>
                      <p style={{ margin:0, fontWeight:800, color:'#1a6b3a', fontSize:16 }}>{fmt(l.amount)}</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <button onClick={() => updateLoanStatus(l.id,'approved')}
                        style={{ background:'#dcfce7', color:'#16a34a', border:'none', borderRadius:10, padding:'10px', fontWeight:700, cursor:'pointer' }}>✅ Approve</button>
                      <button onClick={() => updateLoanStatus(l.id,'rejected')}
                        style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:10, padding:'10px', fontWeight:700, cursor:'pointer' }}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {tab === 'loans' && (
          <>
            <h3 style={{ margin:'0 0 12px', fontSize:17, fontWeight:700 }}>All Loans ({loans.length})</h3>
            {loans.map(l => (
              <div key={l.id} className="card" style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:14 }}>{(l.profiles as {full_name:string}|null)?.full_name || 'Unknown'}</p>
                  <p style={{ margin:0, color:'#6b7280', fontSize:12 }}>{fmt(l.amount)} • {l.purpose?.slice(0,30)}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ background: statusColor[l.status]+'22', color: statusColor[l.status], borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700, display:'block', textTransform:'capitalize' }}>{l.status}</span>
                  {l.status === 'pending' && (
                    <div style={{ display:'flex', gap:6, marginTop:6 }}>
                      <button onClick={() => updateLoanStatus(l.id,'approved')} style={{ background:'#dcfce7', color:'#16a34a', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>✅</button>
                      <button onClick={() => updateLoanStatus(l.id,'rejected')} style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>❌</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'farmers' && (
          <>
            <h3 style={{ margin:'0 0 12px', fontSize:17, fontWeight:700 }}>All Farmers ({farmers.length})</h3>
            {farmers.map(f => (
              <div key={f.id} className="card" style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:14 }}>👨‍🌾 {f.full_name}</p>
                  <p style={{ margin:0, color:'#6b7280', fontSize:12 }}>📍 {f.village || 'Kyenjojo'} • Joined {f.created_at.slice(0,10)}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
