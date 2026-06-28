'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEMO_FARMER = {
  full_name: 'Amanya Katusiime',
  village: 'Butebo',
  savings_balance: 485000,
  loan_balance: 200000,
  loan_due: '2026-07-15',
  credit_score: 72,
  credit_grade: 'B',
  member_months: 14,
}

export default function Dashboard() {
  const [lang, setLang] = useState('english')
  const [greeting, setGreeting] = useState('')
  const [farmer] = useState(DEMO_FARMER)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sacco_lang') || 'english'
      setLang(saved)
    }
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`
  const greetingMap: Record<string, Record<string, string>> = {
    english: { gm: 'Good morning', ga: 'Good afternoon', ge: 'Good evening' },
    runyoro: { gm: 'Oraire ota', ga: 'Osiibire ota', ge: 'Wabagya ota' },
    luganda: { gm: 'Wasuze otya', ga: 'Osiibire otya', ge: 'Osiibye otya' },
  }

  const quickActions = [
    { href: '/farmer/savings', icon: '💰', label: lang === 'runyoro' ? 'Yeka Esente' : lang === 'luganda' ? 'Yeka Ensimbi' : 'Save Money', color: '#1a6b3a' },
    { href: '/farmer/loans', icon: '🤝', label: lang === 'runyoro' ? 'Saba Enjigi' : lang === 'luganda' ? 'Saba Enjigi' : 'Apply Loan', color: '#2563eb' },
    { href: '/farmer/market', icon: '🛒', label: lang === 'runyoro' ? 'Ebiciro' : lang === 'luganda' ? 'Bbeeyi' : 'Crop Prices', color: '#d97706' },
    { href: '/farmer/weather', icon: '🌤', label: lang === 'runyoro' ? 'Obuzigu' : lang === 'luganda' ? 'Empewo' : 'Weather', color: '#0891b2' },
  ]

  const scoreColor = farmer.credit_score >= 70 ? '#16a34a' : farmer.credit_score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{greeting}, 👋</p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{farmer.full_name}</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>📍 {farmer.village}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['EN','RN','LG'].map((l, i) => {
            const codes = ['english','runyoro','luganda']
            return (
              <button key={l} onClick={() => { setLang(codes[i]); localStorage.setItem('sacco_lang', codes[i]) }}
                style={{ background: lang === codes[i] ? '#1a6b3a' : '#e5e7eb', color: lang === codes[i] ? 'white' : '#374151', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {l}
              </button>
            )
          })}
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 20, marginBottom: 16, color: 'white' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{lang === 'runyoro' ? 'Obusindi Bwange' : lang === 'luganda' ? 'Ensimbi Zange' : 'My Savings Balance'}</p>
        <h1 style={{ margin: '4px 0 16px', fontSize: 32, fontWeight: 800 }}>{fmt(farmer.savings_balance)}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{lang === 'runyoro' ? 'Enjigi Ey\'Obwine' : lang === 'luganda' ? 'Enjigi Omuwendo' : 'Loan Balance'}</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{fmt(farmer.loan_balance)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{lang === 'runyoro' ? 'Okwishura' : lang === 'luganda' ? 'Okwishura' : 'Next Payment'}</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>📅 {farmer.loan_due}</p>
          </div>
        </div>
      </div>

      {/* Credit Score */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: `4px solid ${scoreColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: scoreColor }}>{farmer.credit_score}</span>
          <span style={{ fontWeight: 700, fontSize: 12, color: scoreColor }}>{farmer.credit_grade}</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{lang === 'runyoro' ? 'Omuwendo w\'Okwikiriza' : lang === 'luganda' ? 'Akalulu k\'Okwikiriza' : 'Credit Score'}</p>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
            {farmer.credit_score >= 70 ? (lang === 'runyoro' ? 'Kirungi! Okwishura Kwiza.' : lang === 'luganda' ? 'Kirungi! Okwishura Kwerungi.' : '✅ Good standing — eligible for loans') : '⚠️ Keep saving consistently to improve'}
          </p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>{lang === 'runyoro' ? `Omwezi ${farmer.member_months} wa SACCO` : lang === 'luganda' ? `Emyezi ${farmer.member_months} egya SACCO` : `${farmer.member_months} months as member`}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#374151' }}>
        {lang === 'runyoro' ? 'Ibikorwa Byihuse' : lang === 'luganda' ? 'Ebikolwa Amangu' : 'Quick Actions'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {quickActions.map(action => (
          <Link key={action.href} href={action.href}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', borderRadius: 16, padding: '20px 12px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: `2px solid ${action.color}15` }}>
            <span style={{ fontSize: 32 }}>{action.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: action.color, textAlign: 'center' }}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#374151' }}>
        {lang === 'runyoro' ? 'Ibikorwa Bya Vuba' : lang === 'luganda' ? 'Ebikolwa Ebyaggulo' : 'Recent Activity'}
      </h3>
      <div className="card">
        {[
          { icon: '⬆️', label: 'Deposit', amount: '+UGX 50,000', date: 'Jun 25', color: '#16a34a' },
          { icon: '💸', label: 'Loan Repayment', amount: '-UGX 30,000', date: 'Jun 20', color: '#dc2626' },
          { icon: '⬆️', label: 'Deposit', amount: '+UGX 25,000', date: 'Jun 15', color: '#16a34a' },
        ].map((tx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{tx.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{tx.label}</p>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>{tx.date}</p>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: tx.color, fontSize: 15 }}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
