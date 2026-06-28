'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [lang, setLang]     = useState('english')
  const [wallet, setWallet]  = useState<{ savings_balance:number; balance:number; shares_owned:number }|null>(null)
  const [loan, setLoan]      = useState<{ amount:number; repaid_amount:number; due_date:string; status:string }|null>(null)
  const [credit, setCredit]  = useState<{ score:number; grade:string; max_loan_ugx:number }|null>(null)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const saved = localStorage.getItem('sacco_lang') || 'english'; setLang(saved)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    if (user?.id) loadData(user.id)
  }, [user])

  async function loadData(uid: string) {
    const [{ data: w }, { data: loans }, { data: cs }] = await Promise.all([
      supabase.from('wallets').select('savings_balance,balance,shares_owned').eq('user_id', uid).single(),
      supabase.from('loans').select('amount,repaid_amount,due_date,status').eq('farmer_id', uid).eq('status', 'active').order('created_at', { ascending:false }).limit(1),
      supabase.from('credit_scores').select('score,grade,max_loan_ugx').eq('farmer_id', uid).order('calculated_at', { ascending:false }).limit(1),
    ])
    if (w) setWallet(w)
    if (loans?.length) setLoan(loans[0])
    if (cs?.length) setCredit(cs[0])
  }

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`
  const T = (en:string,rn:string,lg:string) => lang==='runyoro' ? rn : lang==='luganda' ? lg : en
  const scoreColor = (s:number) => s >= 70 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626'
  const greet = T(greeting, greeting==='Good morning' ? 'Oraire ota' : 'Osiibire ota', greeting==='Good morning' ? 'Wasuze otya' : 'Osiibire otya')
  const firstName = profile?.full_name?.split(' ')[0] || 'Farmer'

  const quickActions = [
    { href:'/farmer/savings',     icon:'💰', label: T('Save Money','Yeka Esente','Yeka Ensimbi'),   color:'#1a6b3a' },
    { href:'/farmer/loans',       icon:'🤝', label: T('Apply Loan','Saba Enjigi','Saba Enjigi'),     color:'#2563eb' },
    { href:'/farmer/market',      icon:'🛒', label: T('Crop Prices','Ebiciro','Bbeeyi'),              color:'#d97706' },
    { href:'/farmer/weather',     icon:'🌤', label: T('Weather','Obuzigu','Empewo'),                  color:'#0891b2' },
    { href:'/farmer/marketplace', icon:'🏪', label: T('Marketplace','Katale','Katale'),               color:'#7c3aed' },
    { href:'/farmer/gps-field',   icon:'📍', label: T('GPS Field','GPS y\'Oburima','GPS Olugimbi'),  color:'#dc2626' },
  ]

  return (
    <div style={{ padding:16 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{greet} 👋</p>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>{profile?.full_name || '...'}</h2>
          {profile?.village && <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>📍 {profile.village}</p>}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['english','EN'],['runyoro','RN'],['luganda','LG']].map(([code,lbl]) => (
            <button key={code} onClick={() => { setLang(code); localStorage.setItem('sacco_lang',code) }}
              style={{ background: lang===code ? '#1a6b3a' : '#e5e7eb', color: lang===code ? 'white' : '#374151', border:'none', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ background:'linear-gradient(135deg,#1a6b3a,#2d9e56)', borderRadius:20, padding:20, marginBottom:16, color:'white' }}>
        <p style={{ margin:0, fontSize:13, opacity:0.8 }}>{T('My Savings Balance','Obusindi Bwange','Ensimbi Zange')}</p>
        <h1 style={{ margin:'4px 0 16px', fontSize:32, fontWeight:800 }}>
          {wallet ? fmt(wallet.savings_balance) : '...'}
        </h1>
        <div style={{ display:'flex', justifyContent:'space-between', background:'rgba(0,0,0,0.2)', borderRadius:12, padding:12 }}>
          <div>
            <p style={{ margin:0, fontSize:11, opacity:0.7 }}>{T('Loan Balance','Enjigi Ey\'Obwine','Enjigi Omuwendo')}</p>
            <p style={{ margin:0, fontWeight:700, fontSize:16 }}>{loan ? fmt(loan.amount - loan.repaid_amount) : 'None'}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:0, fontSize:11, opacity:0.7 }}>{T('Shares Owned','Ebihisa Byange','Enkyukakyuka Zange')}</p>
            <p style={{ margin:0, fontWeight:700, fontSize:16 }}>📊 {wallet?.shares_owned ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Credit Score */}
      {credit && (
        <div className="card" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', border:`4px solid ${scoreColor(credit.score)}`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', flexShrink:0 }}>
            <span style={{ fontSize:20, fontWeight:800, color:scoreColor(credit.score) }}>{credit.score}</span>
            <span style={{ fontSize:11, fontWeight:700, color:scoreColor(credit.score) }}>{credit.grade}</span>
          </div>
          <div>
            <p style={{ margin:0, fontWeight:700, fontSize:15 }}>{T('Credit Score','Esimu y\'Okwisubirwa','Simu ya Bulungi')}</p>
            <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{T('Max loan:','Enjigi Nkulu:','Enjigi Nkulu:')} {fmt(credit.max_loan_ugx)}</p>
          </div>
        </div>
      )}

      {/* Active Loan */}
      {loan && (
        <div className="card" style={{ marginBottom:16, background:'linear-gradient(135deg,#eff6ff,#dbeafe)', border:'1px solid #bfdbfe' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <p style={{ margin:0, fontWeight:700, color:'#1e40af' }}>🤝 {T('Active Loan','Enjigi y\'Obusha','Enjigi Esookamu')}</p>
            <span style={{ background:'#fbbf24', color:'#78350f', borderRadius:999, padding:'2px 8px', fontSize:12, fontWeight:700 }}>ACTIVE</span>
          </div>
          <div style={{ background:'rgba(0,0,0,0.08)', borderRadius:999, height:8, marginBottom:6 }}>
            <div style={{ background:'#2563eb', borderRadius:999, height:8, width:`${Math.min((loan.repaid_amount/loan.amount)*100,100)}%` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#374151' }}>
            <span>{T('Repaid:','Obwishurwa:','Okushurwa:')} {fmt(loan.repaid_amount)}</span>
            <span>{Math.round((loan.repaid_amount/loan.amount)*100)}% {T('paid','bishurwa','birishurwa')}</span>
          </div>
          <p style={{ margin:'8px 0 0', fontSize:13, color:'#6b7280' }}>📅 {T('Due:','Olunaku:','Olunaku:')} {loan.due_date}</p>
        </div>
      )}

      {/* Quick Actions */}
      <p style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>{T('Quick Actions','Ebikola Bwangu','Ebikola Mangu')}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {quickActions.map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration:'none' }}>
            <div className="card" style={{ textAlign:'center', padding:12 }}>
              <div style={{ fontSize:28, marginBottom:4 }}>{a.icon}</div>
              <p style={{ margin:0, fontSize:11, fontWeight:600, color:a.color }}>{a.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
