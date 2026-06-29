'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/farmer/dashboard', icon: '🏠', label: 'Home', labelRN: 'Ahabaka', labelLG: 'Awaka' },
  { href: '/farmer/savings', icon: '💳', label: 'Savings', labelRN: 'Obusindi', labelLG: 'Ensimbi' },
  { href: '/farmer/loans', icon: '🤝', label: 'Loans', labelRN: 'Enjigi', labelLG: 'Enjigi' },
  { href: '/farmer/marketplace', icon: '🏪', label: 'Market', labelRN: 'Katale', labelLG: 'Katale' },
  { href: '/farmer/weather', icon: '🌤', label: 'Weather', labelRN: 'Obuzigu', labelLG: 'Empewo' },
]

const sideMenuItems = [
  { href: '/farmer/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/farmer/savings', icon: '💳', label: 'My Savings' },
  { href: '/farmer/loans', icon: '🤝', label: 'My Loans' },
  { href: '/farmer/market', icon: '📊', label: 'Crop Prices' },
  { href: '/farmer/marketplace', icon: '🏪', label: 'Marketplace' },
  { href: '/farmer/my-store', icon: '📦', label: 'My Store' },
  { href: '/farmer/gps-field', icon: '📍', label: 'GPS Field Measure' },
  { href: '/farmer/weather', icon: '🌤', label: 'Weather & AI Crops' },
  { href: '/', icon: '🚪', label: 'Logout', danger: true },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)
  const [lang, setLang] = useState('english')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      const saved = localStorage.getItem('sacco_lang') || 'english'
      setLang(saved)
      window.addEventListener('online', () => setIsOnline(true))
      window.addEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  const getLabel = (item: typeof navItems[0]) => {
    if (lang === 'runyoro') return item.labelRN
    if (lang === 'luganda') return item.labelLG
    return item.label
  }

  return (
    <div style={{ paddingBottom: 72, minHeight: '100vh', background: '#FAF8F4' }}>
      {!isOnline && (
        <div className="offline-banner">📵 Offline — Changes saved locally</div>
      )}

      {/* Top header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2ded6', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => setSideOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '4px 0', minHeight: 0, color: '#1a4731' }}>
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#1a4731', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌾</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a4731' }}>Kyenjojo SACCO</span>
        </div>
        <Link href="/farmer/marketplace"
          style={{ background: '#1a4731', color: 'white', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          Shop
        </Link>
      </div>

      {/* Side drawer */}
      {sideOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setSideOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, background: 'white', overflowY: 'auto' }}>
            {/* Drawer header */}
            <div style={{ background: '#1a4731', padding: '28px 20px 20px', color: 'white' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10 }}>🌾</div>
              <p style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Kyenjojo SACCO</p>
              <p style={{ fontSize: 13, opacity: 0.7, margin: '4px 0 0' }}>Farmer Wallet</p>
            </div>
            {/* Menu items */}
            <div style={{ padding: '10px 12px' }}>
              {sideMenuItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', borderRadius: 12, marginBottom: 2, textDecoration: 'none', background: pathname === item.href ? '#e8f5ee' : 'transparent', color: (item as Record<string,unknown>).danger ? '#c0392b' : pathname === item.href ? '#1a4731' : '#374151', fontWeight: pathname === item.href ? 700 : 500, fontSize: 15 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Language picker */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em' }}>LANGUAGE</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['english','EN'],['runyoro','RN'],['luganda','LG']].map(([code,label]) => (
                  <button key={code} onClick={() => { setLang(code); localStorage.setItem('sacco_lang', code) }}
                    style={{ flex: 1, background: lang === code ? '#1a4731' : '#f3f4f6', color: lang === code ? 'white' : '#374151', border: 'none', borderRadius: 8, padding: '8px 4px', fontWeight: 700, fontSize: 13, cursor: 'pointer', minHeight: 0 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {children}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{getLabel(item)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
