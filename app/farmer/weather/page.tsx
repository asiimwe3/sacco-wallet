'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WeatherDay {
  date: string
  temp_max: number
  temp_min: number
  rainfall_mm: number
  advice: string
}

interface CropRec {
  name: string
  emoji: string
  local: string
  score: number
  days_to_harvest: number
  avg_yield_kg_acre: number
  market_price_ugx: number
  estimated_revenue: number
  soil: string
  tips: string[]
}

interface AIData {
  climate: { avgTemp: number; avgRain: number; totalRain14d: number; season: string }
  climate_summary: string
  recommendation_text: string
  top_crops: CropRec[]
  avoid_crops: CropRec[]
  location: string
  offline?: boolean
}

const DEMO_WEATHER: WeatherDay[] = [
  { date: '2026-06-28', temp_max: 26, temp_min: 18, rainfall_mm: 8.4, advice: 'Good rain expected. Ideal for planting beans, maize, and groundnuts.' },
  { date: '2026-06-29', temp_max: 24, temp_min: 17, rainfall_mm: 12.1, advice: 'Heavy rain coming. Good for planting. Avoid harvesting today.' },
  { date: '2026-06-30', temp_max: 27, temp_min: 19, rainfall_mm: 3.5, advice: 'Light rain. Good for weeding and fertilizer application.' },
  { date: '2026-07-01', temp_max: 29, temp_min: 20, rainfall_mm: 0.8, advice: 'Mostly dry. Good for harvesting maize and groundnuts.' },
  { date: '2026-07-02', temp_max: 30, temp_min: 21, rainfall_mm: 0.2, advice: 'Hot and dry. Water crops and avoid planting.' },
  { date: '2026-07-03', temp_max: 28, temp_min: 19, rainfall_mm: 5.2, advice: 'Moderate rain. Good for transplanting seedlings.' },
  { date: '2026-07-04', temp_max: 25, temp_min: 18, rainfall_mm: 9.0, advice: 'Good rain expected. Ideal for planting beans and maize.' },
]

const rainIcon = (mm: number) => mm > 8 ? '🌧️' : mm > 3 ? '🌦️' : mm > 0.5 ? '⛅' : '☀️'
const rainLabel = (mm: number) => mm > 8 ? 'Heavy Rain' : mm > 3 ? 'Light Rain' : mm > 0.5 ? 'Drizzle' : 'Sunny'

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 99 }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32 }}>{score}%</span>
    </div>
  )
}

export default function Weather() {
  const [weather] = useState<WeatherDay[]>(DEMO_WEATHER)
  const [aiData, setAiData] = useState<AIData|null>(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<CropRec|null>(null)
  const [activeTab, setActiveTab] = useState<'forecast'|'ai'|'calendar'>('forecast')
  const [lang] = useState('english')

  useEffect(() => {
    fetch('/api/crop-recommendations')
      .then(r => r.json())
      .then(data => { setAiData(data); setAiLoading(false) })
      .catch(() => { setAiError('Could not load AI recommendations. Using local data.'); setAiLoading(false) })
  }, [])

  const today = weather[0]
  const fmt = (n: number) => `UGX ${n.toLocaleString()}`

  if (selectedCrop) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setSelectedCrop(null)}
          style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', marginBottom: 12, padding: 0, minHeight: 0, color: '#374151' }}>
          ← Back
        </button>
        <div style={{ fontSize: 72, textAlign: 'center', padding: '16px 0' }}>{selectedCrop.emoji}</div>
        <div className="card" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900 }}>{selectedCrop.name}</h2>
          <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: 14 }}>Local: {selectedCrop.local}</p>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#374151' }}>AI Match Score</p>
          <ScoreBar score={selectedCrop.score} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Days to Harvest', value: `${selectedCrop.days_to_harvest} days`, icon: '📅' },
            { label: 'Yield per Acre', value: `${selectedCrop.avg_yield_kg_acre.toLocaleString()} kg`, icon: '⚖️' },
            { label: 'Market Price', value: fmt(selectedCrop.market_price_ugx) + '/kg', icon: '💰' },
            { label: 'Revenue/Acre', value: fmt(selectedCrop.estimated_revenue), icon: '📈' },
          ].map(item => (
            <div key={item.label} className="card" style={{ textAlign: 'center', padding: 12 }}>
              <p style={{ margin: '0 0 4px', fontSize: 22 }}>{item.icon}</p>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 14, color: '#1a6b3a' }}>{item.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 15 }}>🌱 Best Soil: {selectedCrop.soil}</p>
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 15 }}>💡 Farming Tips</p>
          {selectedCrop.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, color: '#1a6b3a', flexShrink: 0 }}>{i+1}.</span>
              <span style={{ fontSize: 14, color: '#166534', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        <Link href="/farmer/marketplace"
          style={{ display: 'block', background: '#d4a017', color: '#1a1a1a', padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none', textAlign: 'center' }}>
          🛒 Buy {selectedCrop.name} Seeds/Inputs
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', padding: '16px 16px 20px', color: 'white' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>🌤 Weather & AI Farming</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>📍 Kyenjojo, Uganda · NASA POWER + AI Crops</p>

        {/* Today summary in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 44 }}>{rainIcon(today.rainfall_mm)}</span>
          <div>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>{today.temp_max}°C</p>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>Low {today.temp_min}°C · {today.rainfall_mm}mm rain · {rainLabel(today.rainfall_mm)}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        {([
          { key:'forecast', label:'🌦 Forecast' },
          { key:'ai', label:'🤖 AI Crops' },
          { key:'calendar', label:'📅 Calendar' },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: activeTab === tab.key ? '3px solid #0ea5e9' : '3px solid transparent', padding: '12px 4px', fontWeight: activeTab === tab.key ? 800 : 500, fontSize: 13, cursor: 'pointer', color: activeTab === tab.key ? '#0369a1' : '#6b7280' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── FORECAST TAB ── */}
        {activeTab === 'forecast' && (
          <>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0369a1', fontSize: 14 }}>🌱 Today's Farming Advice</p>
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: 14, lineHeight: 1.6 }}>{today.advice}</p>
            </div>

            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>7-Day Forecast</h3>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
              {weather.map((day, i) => (
                <div key={day.date} style={{ flexShrink: 0, background: 'white', borderRadius: 16, padding: '12px 10px', textAlign: 'center', minWidth: 76, border: i === 0 ? '2px solid #0ea5e9' : '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                    {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </p>
                  <span style={{ fontSize: 28 }}>{rainIcon(day.rainfall_mm)}</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 15 }}>{day.temp_max}°</p>
                  <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 11 }}>{day.temp_min}°</p>
                  <p style={{ margin: '4px 0 0', color: '#0ea5e9', fontSize: 11, fontWeight: 600 }}>💧{day.rainfall_mm}mm</p>
                </div>
              ))}
            </div>

            {weather.slice(1).map((day, i) => (
              <div key={day.date} className="card" style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{rainIcon(day.rainfall_mm)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#374151' }}>{day.advice}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{day.temp_max}°</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{day.rainfall_mm}mm</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── AI CROPS TAB ── */}
        {activeTab === 'ai' && (
          <>
            {aiLoading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <p style={{ color: '#6b7280' }}>Analysing Kyenjojo weather data...</p>
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Fetching NASA satellite data</p>
              </div>
            )}

            {!aiLoading && aiData && (
              <>
                {/* Climate snapshot */}
                <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 16, marginBottom: 16, color: 'white' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.8, fontWeight: 600 }}>🤖 AI CROP ANALYSIS — KYENJOJO</p>
                  <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>{aiData.climate.season}</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{aiData.climate.avgTemp}°C</p>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Avg Temp (14d)</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{aiData.climate.totalRain14d}mm</p>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Rainfall (14d)</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{aiData.climate.avgRain}mm</p>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Daily Rain Avg</p>
                    </div>
                  </div>
                </div>

                {/* AI recommendation box */}
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: 14, marginBottom: 16 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#92400e', fontSize: 14 }}>🌟 AI Recommendation</p>
                  <p style={{ margin: 0, color: '#78350f', fontSize: 14, lineHeight: 1.6 }}>{aiData.recommendation_text}</p>
                  {aiData.offline && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b45309' }}>⚠️ Using estimated data — connect to internet for live NASA analysis</p>}
                </div>

                {/* Top crops */}
                <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>✅ Best Crops to Plant Now</p>
                {aiData.top_crops.map((crop, i) => (
                  <div key={crop.name} onClick={() => setSelectedCrop(crop)}
                    style={{ background: 'white', borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: i === 0 ? '2px solid #1a6b3a' : '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 36 }}>{crop.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{crop.name}</p>
                          {i === 0 && <span style={{ background: '#d4a017', color: '#1a1a1a', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>TOP PICK</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>🌍 {crop.local} · Harvest in {crop.days_to_harvest} days</p>
                      </div>
                    </div>
                    <ScoreBar score={crop.score} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>📈 Revenue/acre: <strong style={{ color: '#1a6b3a' }}>{(crop.estimated_revenue/1000000).toFixed(1)}M UGX</strong></span>
                      <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>View details →</span>
                    </div>
                  </div>
                ))}

                {/* Avoid crops */}
                {aiData.avoid_crops.length > 0 && (
                  <>
                    <p style={{ margin: '16px 0 12px', fontWeight: 800, fontSize: 16, color: '#dc2626' }}>❌ Avoid Planting Now</p>
                    {aiData.avoid_crops.map(crop => (
                      <div key={crop.name} style={{ background: '#fff5f5', borderRadius: 14, padding: 12, marginBottom: 8, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{crop.emoji}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#dc2626' }}>{crop.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>AI Match: {crop.score}% — conditions not ideal right now</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {!aiLoading && aiError && (
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 14, padding: 16 }}>
                <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>⚠️ {aiError}</p>
              </div>
            )}
          </>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === 'calendar' && (
          <>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#15803d', fontSize: 14 }}>📅 Kyenjojo Farming Seasons</p>
              <p style={{ margin: 0, color: '#166534', fontSize: 13, lineHeight: 1.6 }}>
                <strong>Season A (Long Rains):</strong> March – May{'\n'}
                <strong>Season B (Short Rains):</strong> September – November{'\n'}
                <strong>Dry Season:</strong> June–Aug · December–February
              </p>
            </div>

            {[
              { crop:'Maize 🌽', a:'Plant Mar, harvest Jun', b:'Plant Sep, harvest Dec', dry:'Not recommended', market:'UGX 1,800/kg' },
              { crop:'Beans 🫘', a:'Plant Mar, harvest May', b:'Plant Sep, harvest Nov', dry:'Irrigate only', market:'UGX 4,500/kg' },
              { crop:'Irish Potatoes 🥔', a:'Plant Feb, harvest Jun', b:'Plant Aug, harvest Dec', dry:'With irrigation', market:'UGX 1,200/kg' },
              { crop:'Groundnuts 🥜', a:'Plant Mar, harvest Jul', b:'Not ideal', dry:'Not recommended', market:'UGX 6,000/kg' },
              { crop:'Cassava 🌿', a:'Any time ✅', b:'Any time ✅', dry:'Plant — drought tolerant ✅', market:'UGX 500/kg' },
              { crop:'Coffee ☕', a:'Harvest time', b:'Harvest time', dry:'Manage & prune', market:'UGX 12,000/kg' },
              { crop:'Tomatoes 🍅', a:'With irrigation', b:'With irrigation', dry:'Best season ✅', market:'UGX 2,000/kg' },
              { crop:'Onions 🧅', a:'Not ideal', b:'Not ideal', dry:'Best season ✅', market:'UGX 3,500/kg' },
            ].map(row => (
              <div key={row.crop} className="card" style={{ marginBottom: 10 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 15 }}>{row.crop}</p>
                <p style={{ margin: '0 0 3px', fontSize: 13 }}><span style={{ color: '#1a6b3a', fontWeight: 600 }}>Season A:</span> {row.a}</p>
                <p style={{ margin: '0 0 3px', fontSize: 13 }}><span style={{ color: '#0369a1', fontWeight: 600 }}>Season B:</span> {row.b}</p>
                <p style={{ margin: '0 0 6px', fontSize: 13 }}><span style={{ color: '#d97706', fontWeight: 600 }}>Dry Season:</span> {row.dry}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#16a34a', fontWeight: 700 }}>💰 {row.market}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
