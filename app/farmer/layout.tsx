'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/farmer/dashboard', icon: '🏠', label: 'Home', labelRN: 'Ahabaka', labelLG: 'Awaka' },
  { href: '/farmer/savings', icon: '💰', label: 'Savings', labelRN: 'Obusindi', labelLG: 'Ensimbi' },
  { href: '/farmer/loans', icon: '🤝', label: 'Loans', labelRN: 'Enjigi', labelLG: 'Enjigi' },
  { href: '/farmer/market', icon: '🛒', label: 'Market', labelRN: 'Katale', labelLG: 'Katale' },
  { href: '/farmer/weather', icon: '🌤', label: 'Weather', labelRN: 'Obuzigu', labelLG: 'Empewo' },
]

const sideMenuItems = [
  { href: '/farmer/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/farmer/savings', icon: '💰', label: 'My Savings' },
  { href: '/farmer/loans', icon: '🤝', label: 'My Loans' },
  { href: '/farmer/market', icon: '🛒', label: 'Market Prices' },
  { href: '/farmer/marketplace', icon: '🏪', label: 'Marketplace' },
  { href: '/farmer/my-store', icon: '📦', label: 'My Store / Listings' },
  { href: '/farmer/gps-field', icon: '📍', label: 'GPS Field Measure' },
  { href: '/farmer/weather', icon: '🌤', label: 'Weather' },
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
    <div style={{ paddingBottom: 72, minHeight: '100vh', background: '#f5f7f2' }}>
      {!isOnline && (
        <div className="offline-banner">
          📵 Offline — Changes saved locally, will sync when connected
        </div>
      )}

      {/* Top header bar with hamburger */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => setSideOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: '4px 8px', minHeight: 0 }}>
          ☰
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1a6b3a' }}>🌾 SACCO Wallet</span>
        <Link href="/farmer/marketplace"
          style={{ background: '#d4a017', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
          🏪 Shop
        </Link>
      </div>

      {/* Side Menu Overlay */}
      {sideOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setSideOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, background: 'white', overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}>
            {/* Side menu header */}
            <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', padding: '24px 20px 20px', color: 'white' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌾</div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>SACCO Wallet</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.8 }}>Kyenjojo Farmers SACCO</p>
            </div>

            {/* Menu items */}
            <div style={{ padding: 12 }}>
              {sideMenuItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setSideOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 16px', borderRadius: 12, marginBottom: 4,
                    textDecoration: 'none',
                    background: pathname === item.href ? '#f0fdf4' : 'transparent',
                    color: (item as any).danger ? '#dc2626' : pathname === item.href ? '#1a6b3a' : '#374151',
                    fontWeight: pathname === item.href ? 700 : 500,
                    fontSize: 15,
                  }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Language picker in side menu */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>LANGUAGE / OLUGANDA</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{code:'english',label:'EN'},{code:'runyoro',label:'RN'},{code:'luganda',label:'LG'}].map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem('sacco_lang', l.code) }}
                    style={{ flex: 1, background: lang === l.code ? '#1a6b3a' : '#f3f4f6', color: lang === l.code ? 'white' : '#374151', border: 'none', borderRadius: 8, padding: '8px 4px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {children}

      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span>{getLabel(item)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
