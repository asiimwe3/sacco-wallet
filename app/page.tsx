'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [lang, setLang] = useState('english')

  const text: Record<string, Record<string, string>> = {
    english: { title: 'SACCO Wallet', sub: 'Digital banking for Kyenjojo farmers', farmer: 'Farmer Login', admin: 'Admin Dashboard', register: 'New Farmer? Register', tagline: 'Save. Borrow. Grow.' },
    runyoro: { title: 'SACCO Wallet', sub: 'Obusindi bw\'Obuhinzi — Kyenjojo', farmer: 'Injira (Omuhizi)', admin: 'Omukuru wa SACCO', register: 'Omuhizi Omushasha? Jimu', tagline: 'Sindika. Gula. Hinda.' },
    luganda: { title: 'SACCO Wallet', sub: 'Ensimbi z\'Abalimba — Kyenjojo', farmer: 'Yingira (Okulima)', admin: 'Omukuumi wa SACCO', register: 'Omulimu Omupya? Wandiika', tagline: 'Leka. Saba. Grow.' },
  }

  const T = text[lang]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a6b3a 0%, #0f4225 60%, #0a2e19 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Language picker */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {['english', 'runyoro', 'luganda'].map(l => (
          <button key={l} onClick={() => setLang(l)}
            style={{ background: lang === l ? '#d4a017' : 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {l === 'english' ? 'EN' : l === 'runyoro' ? 'RN' : 'LG'}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#d4a017', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40 }}>🌾</div>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0 }}>{T.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 15 }}>{T.sub}</p>
        <p style={{ color: '#d4a017', fontWeight: 700, fontSize: 18, marginTop: 4 }}>{T.tagline}</p>
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/farmer/dashboard" style={{ display: 'block', background: '#d4a017', color: '#1a1a1a', textAlign: 'center', padding: '16px 24px', borderRadius: 16, fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
          🌾 {T.farmer}
        </Link>
        <Link href="/farmer/register" style={{ display: 'block', background: 'rgba(255,255,255,0.12)', color: 'white', textAlign: 'center', padding: '14px 24px', borderRadius: 16, fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
          ➕ {T.register}
        </Link>
        <Link href="/admin" style={{ display: 'block', background: 'transparent', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '12px 24px', borderRadius: 16, fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
          ⚙️ {T.admin}
        </Link>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 40 }}>Kyenjojo SACCO • Privacy First • Offline Ready</p>
    </div>
  )
}
