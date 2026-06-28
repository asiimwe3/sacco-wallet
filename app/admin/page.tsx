'use client'
import { useState } from 'react'
import Link from 'next/link'

const STATS = {
  total_farmers: 247,
  active_loans: 89,
  total_savings: 48750000,
  total_loans_disbursed: 125000000,
  repayment_rate: 91.3,
  new_this_month: 12,
}

const RECENT_FARMERS = [
  { id: '1', name: 'Amanya Katusiime', village: 'Butebo', savings: 485000, loan: 200000, score: 72, grade: 'B', status: 'active' },
  { id: '2', name: 'Birungi Joyce', village: 'Kyarusozi', savings: 320000, loan: 0, score: 85, grade: 'A', status: 'active' },
  { id: '3', name: 'Mugisha Robert', village: 'Mpara', savings: 150000, loan: 500000, score: 48, grade: 'C', status: 'active' },
  { id: '4', name: 'Kahwa Beatrice', village: 'Nyabuharwa', savings: 780000, loan: 1000000, score: 78, grade: 'B', status: 'active' },
  { id: '5', name: 'Tusiime Patrick', village: 'Butunduzi', savings: 95000, loan: 0, score: 35, grade: 'D', status: 'pending' },
]

const PENDING_LOANS = [
  { id: '1', farmer: 'Mugisha Robert', amount: 300000, purpose: 'Buying seeds and fertilizer', days_ago: 2, score: 48 },
  { id: '2', farmer: 'Kasande Mary', amount: 750000, purpose: 'Farm equipment', days_ago: 1, score: 65 },
  { id: '3', farmer: 'Byamukama John', amount: 1500000, purpose: 'Building/housing', days_ago: 0, score: 82 },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview'|'loans'|'farmers'>('overview')

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f2' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '20px 20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>⚙️ SACCO Admin</h1>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Kyenjojo Farmers SACCO</p>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>Logout</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 4 }}>
          {(['overview','loans','farmers'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#1a1a2e' : 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 10, padding: '8px 4px', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Farmers', value: STATS.total_farmers.toString(), icon: '👨‍🌾', color: '#1a6b3a' },
                { label: 'Active Loans', value: STATS.active_loans.toString(), icon: '🤝', color: '#2563eb' },
                { label: 'Total Savings', value: fmt(STATS.total_savings), icon: '💰', color: '#d97706' },
                { label: 'Repayment Rate', value: `${STATS.repayment_rate}%`, icon: '📊', color: '#7c3aed' },
              ].map(kpi => (
                <div key={kpi.label} className="card" style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 32 }}>{kpi.icon}</span>
                  <p style={{ margin: '8px 0 2px', fontWeight: 800, fontSize: 20, color: kpi.color }}>{kpi.value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div className="card" style={{ marginBottom: 16, background: '#fef3c7', border: '1px solid #fcd34d' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#92400e' }}>⚠️ {PENDING_LOANS.length} Loan Applications Pending</p>
              <p style={{ margin: 0, fontSize: 13, color: '#78350f' }}>Review and approve or reject within 48 hours.</p>
              <button onClick={() => setActiveTab('loans')}
                style={{ marginTop: 8, background: '#d97706', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Review Now →
              </button>
            </div>

            {/* Monthly Summary */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px', color: '#374151' }}>📈 This Month</h4>
              {[
                { label: 'New Members', value: `+${STATS.new_this_month}` },
                { label: 'Loans Disbursed', value: 'UGX 8,200,000' },
                { label: 'Repayments Received', value: 'UGX 5,400,000' },
                { label: 'Savings Deposited', value: 'UGX 3,750,000' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#1a6b3a' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Link href="/admin/farmers" style={{ background: '#1a6b3a', color: 'white', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                👨‍🌾 Manage Farmers
              </Link>
              <Link href="/admin/reports" style={{ background: '#1e40af', color: 'white', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                📊 Reports
              </Link>
            </div>
          </>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <>
            <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700 }}>🤝 Pending Loan Applications</h3>
            {PENDING_LOANS.map(loan => (
              <div key={loan.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{loan.farmer}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>{loan.days_ago === 0 ? 'Today' : `${loan.days_ago}d ago`} • {loan.purpose}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#1e40af' }}>{fmt(loan.amount)}</p>
                    <span style={{ fontSize: 12, fontWeight: 700, color: loan.score >= 70 ? '#16a34a' : loan.score >= 50 ? '#d97706' : '#dc2626' }}>
                      Score: {loan.score}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    ✅ Approve
                  </button>
                  <button style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}

            <h3 style={{ margin: '20px 0 12px', fontSize: 17, fontWeight: 700 }}>📋 Active Loans</h3>
            {RECENT_FARMERS.filter(f => f.loan > 0).map(f => (
              <div key={f.id} className="card" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{f.name}</p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>📍 {f.village}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#dc2626' }}>{fmt(f.loan)}</p>
                  <span className="badge badge-yellow">Active</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Farmers Tab */}
        {activeTab === 'farmers' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>👨‍🌾 All Farmers ({STATS.total_farmers})</h3>
              <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>+{STATS.new_this_month} this month</span>
            </div>
            {RECENT_FARMERS.map(f => (
              <div key={f.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{f.name}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>📍 {f.village}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: f.score >= 70 ? '#16a34a' : f.score >= 50 ? '#d97706' : '#dc2626' }}>
                      Score: {f.score} ({f.grade})
                    </span>
                    <br />
                    <span style={{ fontSize: 12, color: f.status === 'active' ? '#16a34a' : '#d97706' }}>● {f.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <span>💰 {fmt(f.savings)}</span>
                  <span style={{ color: f.loan > 0 ? '#dc2626' : '#16a34a' }}>🤝 {f.loan > 0 ? fmt(f.loan) + ' loan' : 'No loan'}</span>
                </div>
              </div>
            ))}
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 12 }}>Showing 5 of {STATS.total_farmers} farmers</p>
          </>
        )}
      </div>
    </div>
  )
}
