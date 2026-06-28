'use client'
import { useState, useEffect } from 'react'

const PRICES = [
  { id: '1', crop: 'Maize', icon: '🌽', price_per_kg: 850, market: 'Kyenjojo Town', trend: 'up', change: '+5%' },
  { id: '2', crop: 'Beans', icon: '🫘', price_per_kg: 2800, market: 'Kyenjojo Town', trend: 'stable', change: '0%' },
  { id: '3', crop: 'Groundnuts', icon: '🥜', price_per_kg: 4200, market: 'Kyenjojo Town', trend: 'up', change: '+8%' },
  { id: '4', crop: 'Cassava', icon: '🥔', price_per_kg: 450, market: 'Kyenjojo Town', trend: 'down', change: '-3%' },
  { id: '5', crop: 'Coffee (Robusta)', icon: '☕', price_per_kg: 5500, market: 'Fort Portal', trend: 'up', change: '+12%' },
  { id: '6', crop: 'Banana (Matooke)', icon: '🍌', price_per_kg: 700, market: 'Kyenjojo Town', trend: 'stable', change: '0%' },
  { id: '7', crop: 'Sweet Potato', icon: '🍠', price_per_kg: 600, market: 'Kyenjojo Town', trend: 'up', change: '+4%' },
  { id: '8', crop: 'Sorghum', icon: '🌾', price_per_kg: 1100, market: 'Kyenjojo Town', trend: 'down', change: '-2%' },
  { id: '9', crop: 'Tomatoes', icon: '🍅', price_per_kg: 1800, market: 'Fort Portal', trend: 'up', change: '+15%' },
  { id: '10', crop: 'Sunflower', icon: '🌻', price_per_kg: 1600, market: 'Kamwenge', trend: 'stable', change: '+1%' },
]

export default function Market() {
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('english')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLang(localStorage.getItem('sacco_lang') || 'english')
    }
  }, [])

  const filtered = PRICES.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()))

  const trendIcon = (t: string) => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️'
  const trendColor = (t: string) => t === 'up' ? '#16a34a' : t === 'down' ? '#dc2626' : '#6b7280'

  const title = lang === 'runyoro' ? 'Ebiciro by\'Obutungo' : lang === 'luganda' ? 'Bbeeyi z\'Obutungo' : 'Market Prices'
  const updated = lang === 'runyoro' ? 'Kibunwa: Buri Lusiku' : lang === 'luganda' ? 'Kivunanyizibwa: Buli Lunaku' : 'Updated daily'

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🛒 {title}</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>📅 {updated} • Kyenjojo Area</p>
        </div>
      </div>

      {/* Best Price Alert */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: 14 }}>🔥 Trending: Coffee is up 12%!</p>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#78350f' }}>Best time to sell at Fort Portal market (UGX 5,500/kg)</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'runyoro' ? 'Noosha ebihingwa...' : lang === 'luganda' ? 'Noonya ebirimu...' : 'Search crops...'}
          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 12px 12px 40px', fontSize: 16, outline: 'none', background: 'white' }} />
      </div>

      {/* Price List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{item.crop}</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 12 }}>📍 {item.market}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#1a6b3a' }}>UGX {item.price_per_kg.toLocaleString()}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>per kg</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: trendColor(item.trend) }}>
                {trendIcon(item.trend)} {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 20 }}>
        Prices collected from local markets. Always verify before selling.
      </p>
    </div>
  )
}
