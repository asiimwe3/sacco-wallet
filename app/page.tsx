'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [lang, setLang] = useState('english')

  const T = (en: string, rn: string, lg: string) =>
    lang === 'runyoro' ? rn : lang === 'luganda' ? lg : en

  const features = [
    { icon: '💳', title: T('Wallet & savings','Ensafu & Obusindi','Ensafu & Ensimbi'), sub: T('Deposit, withdraw, track balance','Yeka, Gya, Reba Esente','Yeka, Gya, Kebera Ensimbi') },
    { icon: '📈', title: T('Live market prices','Ebiciro bya Katale','Bbeeyi z\'Akatale'), sub: T('Coffee, maize, beans, bananas...','Kahawa, kasooli, ebinyeebwa...','Kawunga, emwanyi, ebinywa...') },
    { icon: '🔒', title: T('Private by design','Obukwekweka','Ekyama'), sub: T('GPS only with your consent','GPS ha kwesiga kwawe bweka','GPS ku kwemera kwo') },
    { icon: '🌤', title: T('Weather & AI crops','Obuzigu & Ebihingwa','Empewo & Ebirimu'), sub: T('Smart planting recommendations','Amagezi g\'okuhinga','Ebiragiro by\'okulima') },
    { icon: '🏪', title: T('Marketplace','Katale','Akatale'), sub: T('Buy and sell farm products','Gula & Gurisa eby\'eihindu','Gula & Gurisa by\'ennimiro') },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', padding: '24px 20px 40px' }}>

      {/* Top bar: logo + language */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#1a4731', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌾</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a4731' }}>Kyenjojo SACCO</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['english','EN'],['runyoro','RN'],['luganda','LG']].map(([code,label]) => (
            <button key={code} onClick={() => setLang(code)}
              style={{ background: lang === code ? '#1a4731' : 'transparent', color: lang === code ? 'white' : '#5a6a5e', border: `1px solid ${lang === code ? '#1a4731' : '#e2ded6'}`, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 0 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero text */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, color: '#1a1a1a', marginBottom: 8 }}>
          {T('A simple digital wallet for', 'Ensafu enyangu ya', 'Ensafu enyangu ey\'')}{' '}
          <span style={{ color: '#1a4731' }}>{T('farmers.', 'Abahinzi.', 'Abalimi.')}</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5a6a5e', lineHeight: 1.65 }}>
          {T(
            'Save with your SACCO, track loans, check market prices for coffee, maize, beans and more, and see the weather outlook for your village — all on one screen.',
            'Bika esente, kurikira enjigi, reba ebiciro bya katale, nobuzigu bwa kyaro kyo — byona kuri ekisaawe kimwe.',
            'Sindika ensimbi, kurikira enjigi, kebera bbeeyi z\'akatale n\'empewo y\'ekyalo kyo — byona ku kkanampawulo emu.'
          )}
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        <Link href="/farmer/register" className="btn-primary" style={{ fontSize: 17, padding: '18px' }}>
          {T('Get started', 'Tandika', 'Tandika')}
        </Link>
        <Link href="/farmer/dashboard" className="btn-outline">
          {T('I already have an account', 'Nindaaza nifunye akaunti', 'Nnabaamu akaunti')}
        </Link>
      </div>

      {/* Feature rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f, i) => (
          <div key={i} className="feature-row">
            <div className="feature-icon">{f.icon}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 2 }}>{f.title}</p>
              <p style={{ fontSize: 13, color: '#5a6a5e' }}>{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 32 }}>
        Kyenjojo SACCO · Privacy First · Offline Ready
      </p>
    </div>
  )
}
