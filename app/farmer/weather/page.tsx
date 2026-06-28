'use client'
import { useState, useEffect } from 'react'

const DEMO_WEATHER = [
  { date: '2026-06-28', temp_max: 26, temp_min: 18, rainfall_mm: 8.4, advice: 'Good rain expected. Ideal for planting beans, maize, and groundnuts.' },
  { date: '2026-06-29', temp_max: 24, temp_min: 17, rainfall_mm: 12.1, advice: 'Heavy rain coming. Good for planting. Avoid harvesting today.' },
  { date: '2026-06-30', temp_max: 27, temp_min: 19, rainfall_mm: 3.5, advice: 'Light rain. Good for weeding and fertilizer application.' },
  { date: '2026-07-01', temp_max: 29, temp_min: 20, rainfall_mm: 0.8, advice: 'Mostly dry. Good for harvesting maize and groundnuts.' },
  { date: '2026-07-02', temp_max: 30, temp_min: 21, rainfall_mm: 0.2, advice: 'Hot and dry. Water crops and avoid planting.' },
  { date: '2026-07-03', temp_max: 28, temp_min: 19, rainfall_mm: 5.2, advice: 'Moderate rain. Good for transplanting seedlings.' },
  { date: '2026-07-04', temp_max: 25, temp_min: 18, rainfall_mm: 9.0, advice: 'Good rain expected. Ideal for planting beans, maize, and groundnuts.' },
]

const PLANTING_CALENDAR = [
  { crop: 'Maize 🌽', best_months: 'Mar–May, Sep–Nov', current: 'Not ideal', tip: 'Wait for September rains for second season' },
  { crop: 'Beans 🫘', best_months: 'Mar–May, Sep–Oct', current: 'Not ideal', tip: 'Plant in September for a good harvest' },
  { crop: 'Groundnuts 🥜', best_months: 'Mar–May', current: 'Not ideal', tip: 'Best planted at the start of the long rains' },
  { crop: 'Cassava 🥔', best_months: 'Year-round', current: '✅ Good now', tip: 'Can be planted any time — good drought resistance' },
  { crop: 'Coffee ☕', best_months: 'Apr–Jun', current: '⚠️ Harvest time', tip: 'Harvest and dry coffee now while weather is good' },
]

export default function Weather() {
  const [weather] = useState(DEMO_WEATHER)
  const [lang] = useState('english')

  const rainIcon = (mm: number) => mm > 8 ? '🌧️' : mm > 3 ? '🌦️' : mm > 0.5 ? '⛅' : '☀️'
  const rainLabel = (mm: number) => mm > 8 ? 'Heavy Rain' : mm > 3 ? 'Light Rain' : mm > 0.5 ? 'Drizzle' : 'Sunny'

  const today = weather[0]

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>🌤 Weather & Farming</h2>
      <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 13 }}>📍 Kyenjojo, Uganda • NASA POWER Data</p>

      {/* Today's Weather */}
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', borderRadius: 20, padding: 20, marginBottom: 16, color: 'white' }}>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>Today — {today.date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }}>
          <span style={{ fontSize: 56 }}>{rainIcon(today.rainfall_mm)}</span>
          <div>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>{today.temp_max}°C</p>
            <p style={{ margin: 0, opacity: 0.7 }}>Low: {today.temp_min}°C</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>💧 Rainfall: {today.rainfall_mm}mm — {rainLabel(today.rainfall_mm)}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>🌱 {today.advice}</p>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>7-Day Forecast</h3>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {weather.map((day, i) => (
          <div key={day.date} style={{ flexShrink: 0, background: 'white', borderRadius: 16, padding: '12px 10px', textAlign: 'center', minWidth: 72, border: i === 0 ? '2px solid #0ea5e9' : '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
              {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </p>
            <span style={{ fontSize: 28 }}>{rainIcon(day.rainfall_mm)}</span>
            <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 14 }}>{day.temp_max}°</p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>{day.rainfall_mm}mm</p>
          </div>
        ))}
      </div>

      {/* Farming Advice */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 8px', color: '#15803d', fontSize: 16 }}>🌱 This Week's Farming Advice</h4>
        <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
          Rain is expected for the next 2 days — excellent time to plant fast-growing crops like beans and maize. 
          Dry spell from Thursday onward — use that time to harvest any ready crops and apply herbicides.
        </p>
      </div>

      {/* Planting Calendar */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>📅 Crop Calendar — Kyenjojo</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PLANTING_CALENDAR.map(crop => (
          <div key={crop.crop} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{crop.crop}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: crop.current.includes('✅') ? '#16a34a' : crop.current.includes('⚠️') ? '#d97706' : '#6b7280' }}>
                {crop.current}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Best months: {crop.best_months}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#374151' }}>💡 {crop.tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
