'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/farmer/dashboard', icon: '🏠', label: 'Home', labelRN: 'Ahabaka', labelLG: 'Awaka' },
  { href: '/farmer/savings', icon: '💰', label: 'Savings', labelRN: 'Obusindi', labelLG: 'Ensimbi' },
  { href: '/farmer/loans', icon: '🤝', label: 'Loans', labelRN: 'Enjigi', labelLG: 'Enjigi' },
  { href: '/farmer/market', icon: '🛒', label: 'Market', labelRN: 'Katale', labelLG: 'Katale' },
  { href: '/farmer/weather', icon: '🌤', label: 'Weather', labelRN: 'Obuzigu', labelLG: 'Empewo' },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)
  const [lang, setLang] = useState('english')

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
