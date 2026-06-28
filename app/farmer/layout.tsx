'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { href:'/farmer/dashboard', icon:'🏠', label:'Home', rn:'Ahabaka', lg:'Awaka' },
  { href:'/farmer/savings',   icon:'💰', label:'Savings', rn:'Obusindi', lg:'Ensimbi' },
  { href:'/farmer/loans',     icon:'🤝', label:'Loans', rn:'Enjigi', lg:'Enjigi' },
  { href:'/farmer/market',    icon:'🛒', label:'Market', rn:'Katale', lg:'Katale' },
  { href:'/farmer/weather',   icon:'🌤', label:'Weather', rn:'Obuzigu', lg:'Empewo' },
]
const SIDE = [
  { href:'/farmer/dashboard',   icon:'🏠', label:'Dashboard' },
  { href:'/farmer/savings',     icon:'💰', label:'My Savings' },
  { href:'/farmer/loans',       icon:'🤝', label:'My Loans' },
  { href:'/farmer/market',      icon:'🛒', label:'Market Prices' },
  { href:'/farmer/marketplace', icon:'🏪', label:'Marketplace' },
  { href:'/farmer/my-store',    icon:'📦', label:'My Store' },
  { href:'/farmer/gps-field',   icon:'📍', label:'GPS Field Measure' },
  { href:'/farmer/weather',     icon:'🌤', label:'Weather' },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [online, setOnline]   = useState(true)
  const [lang, setLang]       = useState('english')
  const [sideOpen, setSideOpen] = useState(false)
  const { profile, signOut, loading } = useAuth()

  useEffect(() => {
    setOnline(navigator.onLine)
    const onL = () => setOnline(true), offL = () => setOnline(false)
    window.addEventListener('online', onL); window.addEventListener('offline', offL)
    const saved = localStorage.getItem('sacco_lang') || 'english'; setLang(saved)
    return () => { window.removeEventListener('online',onL); window.removeEventListener('offline',offL) }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !profile) router.push('/')
  }, [loading, profile, router])

  const label = (item: typeof NAV[0]) => lang==='runyoro' ? item.rn : lang==='luganda' ? item.lg : item.label
  const firstName = profile?.full_name?.split(' ')[0] || 'Farmer'

  async function handleSignOut() {
    await signOut(); router.push('/')
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f5f7f2' }}><div style={{ fontSize:40 }}>🌾</div></div>

  return (
    <div style={{ paddingBottom:72, minHeight:'100vh', background:'#f5f7f2' }}>
      {!online && <div className="offline-banner">📵 Offline — Changes saved locally, will sync when connected</div>}

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid #e5e7eb', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => setSideOpen(true)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', padding:'4px 8px', minHeight:0 }}>☰</button>
        <span style={{ fontWeight:800, fontSize:16, color:'#1a6b3a' }}>🌾 SACCO Wallet</span>
        <Link href="/farmer/marketplace" style={{ background:'#d4a017', color:'white', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700, textDecoration:'none' }}>🏪 Shop</Link>
      </div>

      {/* Side drawer */}
      {sideOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100 }}>
          <div onClick={() => setSideOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} />
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:280, background:'white', overflowY:'auto', boxShadow:'4px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ background:'linear-gradient(135deg,#1a6b3a,#2d9e56)', padding:'24px 20px 20px', color:'white' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🌾</div>
              <p style={{ margin:0, fontWeight:800, fontSize:18 }}>SACCO Wallet</p>
              <p style={{ margin:'4px 0 8px', fontSize:13, opacity:0.8 }}>Kyenjojo Farmers SACCO</p>
              <p style={{ margin:0, fontSize:14, fontWeight:600 }}>👤 {firstName}</p>
              {profile?.village && <p style={{ margin:'2px 0 0', fontSize:12, opacity:0.7 }}>📍 {profile.village}</p>}
            </div>
            {/* Lang toggle */}
            <div style={{ padding:'12px 16px', display:'flex', gap:8, borderBottom:'1px solid #e5e7eb' }}>
              {[['english','EN'],['runyoro','RN'],['luganda','LG']].map(([code,label]) => (
                <button key={code} onClick={() => { setLang(code); localStorage.setItem('sacco_lang',code); setSideOpen(false) }}
                  style={{ flex:1, background: lang===code ? '#1a6b3a' : '#e5e7eb', color: lang===code ? 'white' : '#374151', border:'none', borderRadius:8, padding:'6px 0', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ padding:'8px 0' }}>
              {SIDE.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', color: pathname===item.href ? '#1a6b3a' : '#374151', fontWeight: pathname===item.href ? 700 : 500, textDecoration:'none', background: pathname===item.href ? '#f0fdf4' : 'transparent', fontSize:15 }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>{item.label}
                </Link>
              ))}
              <button onClick={handleSignOut}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', color:'#dc2626', fontWeight:500, background:'none', border:'none', cursor:'pointer', width:'100%', fontSize:15 }}>
                <span style={{ fontSize:20 }}>🚪</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {children}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(item => (
          <Link key={item.href} href={item.href} className={`nav-item${pathname===item.href ? ' active' : ''}`}>
            <span style={{ fontSize:22 }}>{item.icon}</span>
            <span>{label(item)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
