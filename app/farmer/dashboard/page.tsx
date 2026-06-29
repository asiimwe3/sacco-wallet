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
  const [greeting, setGreeting] = useState('Good morning')
  const [farmer] = useState(DEMO_FARMER)
  const [farmerName, setFarmerName] = useState(DEMO_FARMER.full_name)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sacco_lang') || 'english'
      setLang(saved)
      const name = localStorage.getItem('sacco_farmer_name')
      if (name) setFarmerName(name)
    }
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  const T = (en: string, rn: string, lg: string) =>
    lang === 'runyoro' ? rn : lang === 'luganda' ? lg : en

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`
  const firstName = farmerName.split(' ')[0]

  const quickActions = [
    { href: '/farmer/savings', icon: '💳', label: T('Save Money','Yeka Esente','Yeka Ensimbi') },
    { href: '/farmer/loans', icon: '🤝', label: T('Apply Loan','Saba Enjigi','Saba Enjigi') },
    { href: '/farmer/marketplace', icon: '🏪', label: T('Marketplace','Katale','Akatale') },
    { href: '/farmer/weather', icon: '🌤', label: T('AI Crops','Ebihingwa','Ebirimu') },
  ]

  const scoreColor = farmer.credit_score >= 70 ? '#1a4731' : farmer.credit_score >= 50 ? '#c8961e' : '#c0392b'

  return (
    <div style={{ padding: '20px 20px 8px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#5a6a5e', fontSize: 14, marginBottom: 2 }}>{greeting} 👋</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 2 }}>{firstName}</h2>
        <p style={{ color: '#8a9a8e', fontSize: 13 }}>📍 {farmer.village}</p>
      </div>

      {/* Balance card */}
      <div style={{ background: '#1a4731', borderRadius: 24, padding: 24, marginBottom: 16, color: 'white' }}>
        <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 4 }}>
          {T('My Savings Balance','Obusindi Bwange','Ensimbi Zange')}
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 20, letterSpacing: '-0.5px' }}>
          {fmt(farmer.savings_balance)}
        </h1>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ opacity: 0.65, fontSize: 11, marginBottom: 2 }}>{T('Loan Balance','Enjigi y\'Obwine','Enjigi Omuwendo')}</p>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{fmt(farmer.loan_balance)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ opacity: 0.65, fontSize: 11, marginBottom: 2 }}>{T('Next Payment','Okwishura','Okwishura')}</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>📅 {farmer.loan_due}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {quickActions.map(action => (
          <Link key={action.href} href={action.href}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'white', borderRadius: 18, padding: '18px 12px', textDecoration: 'none', border: '1px solid #e2ded6' }}>
            <span style={{ fontSize: 28 }}>{action.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a4731', textAlign: 'center' }}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Credit score */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', border: `3px solid ${scoreColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: 17, color: scoreColor }}>{farmer.credit_score}</span>
          <span style={{ fontWeight: 700, fontSize: 11, color: scoreColor }}>{farmer.credit_grade}</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{T('Credit Score','Omuwendo w\'Okwikiriza','Akalulu k\'Okwikiriza')}</p>
          <p style={{ color: '#5a6a5e', fontSize: 13 }}>
            {farmer.credit_score >= 70 ? T('✅ Good standing — eligible for loans','✅ Kirungi — Okwishura Kwiza','✅ Kirungi — Okwishura Kwerungi') : '⚠️ Keep saving to improve'}
          </p>
          <p style={{ color: '#8a9a8e', fontSize: 12, marginTop: 2 }}>{farmer.member_months} {T('months as member','emyezi w\'omugibi','emyezi gy\'omwanzi')}</p>
        </div>
      </div>

      {/* Recent transactions */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
        {T('Recent Activity','Ibikorwa Bya Vuba','Ebikolwa Ebyaggulo')}
      </h3>
      <div className="card">
        {[
          { icon: '⬆️', label: T('Deposit','Okyusibira','Okuyingiza'), amount: '+UGX 50,000', date: 'Jun 25', color: '#1a4731' },
          { icon: '💸', label: T('Loan Repayment','Okwishura Enjigi','Okwishura Enjigi'), amount: '-UGX 30,000', date: 'Jun 20', color: '#c0392b' },
          { icon: '⬆️', label: T('Deposit','Okyusibira','Okuyingiza'), amount: '+UGX 25,000', date: 'Jun 15', color: '#1a4731' },
        ].map((tx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{tx.icon}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 1 }}>{tx.label}</p>
                <p style={{ color: '#8a9a8e', fontSize: 12 }}>{tx.date}</p>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: tx.color, fontSize: 15 }}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
