'use client'
import { useState, useEffect, useRef } from 'react'

interface GPSPoint {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
  label: string
}

interface FieldMeasurement {
  id: string
  name: string
  points: GPSPoint[]
  area_sqm: number
  area_acres: number
  perimeter_m: number
  date: string
}

// Haversine formula — distance between two GPS coords in metres
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Shoelace formula for polygon area in sq metres
function polygonArea(points: GPSPoint[]): number {
  if (points.length < 3) return 0
  const R = 6371000
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const xi = points[i].lng * Math.PI / 180
    const yi = points[i].lat * Math.PI / 180
    const xj = points[j].lng * Math.PI / 180
    const yj = points[j].lat * Math.PI / 180
    area += xi * yj
    area -= xj * yi
  }
  return Math.abs(area) * R * R / 2
}

function polygonPerimeter(points: GPSPoint[]): number {
  let perim = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    perim += haversineDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng)
  }
  return perim
}

const SQM_TO_ACRES = 0.000247105

export default function GPSField() {
  const [points, setPoints] = useState<GPSPoint[]>([])
  const [watching, setWatching] = useState(false)
  const [currentPos, setCurrentPos] = useState<{lat:number,lng:number,accuracy:number}|null>(null)
  const [error, setError] = useState('')
  const [fieldName, setFieldName] = useState('My Farm Field')
  const [saved, setSaved] = useState<FieldMeasurement[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('sacco_fields') || '[]') } catch { return [] }
  })
  const [view, setView] = useState<'measure' | 'history'>('measure')
  const [status, setStatus] = useState('Tap "Get Location" to start')
  const watchRef = useRef<number|null>(null)

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  const startWatching = () => {
    setError('')
    setStatus('Finding your location...')
    if (!navigator.geolocation) {
      setError('GPS is not supported on this device.')
      return
    }
    setWatching(true)
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
        setStatus(`📍 GPS locked — Accuracy: ±${Math.round(pos.coords.accuracy)}m`)
        setError('')
      },
      err => {
        setError(`GPS error: ${err.message}. Make sure location is enabled.`)
        setWatching(false)
        setStatus('GPS failed — tap Get Location to retry')
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }

  const stopWatching = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    watchRef.current = null
    setWatching(false)
    setStatus('GPS paused')
  }

  const addPoint = () => {
    if (!currentPos) {
      setError('Wait for GPS to lock before adding a point.')
      return
    }
    const newPoint: GPSPoint = {
      lat: currentPos.lat,
      lng: currentPos.lng,
      accuracy: currentPos.accuracy,
      timestamp: Date.now(),
      label: `Corner ${points.length + 1}`,
    }
    setPoints(prev => [...prev, newPoint])
    setStatus(`✅ Corner ${points.length + 1} added! Walk to next corner.`)
  }

  const removeLastPoint = () => {
    setPoints(prev => prev.slice(0, -1))
  }

  const area_sqm = polygonArea(points)
  const area_acres = area_sqm * SQM_TO_ACRES
  const perimeter_m = polygonPerimeter(points)

  const saveMeasurement = () => {
    if (points.length < 3) return
    const measurement: FieldMeasurement = {
      id: Date.now().toString(),
      name: fieldName,
      points,
      area_sqm,
      area_acres,
      perimeter_m,
      date: new Date().toLocaleDateString(),
    }
    const updated = [measurement, ...saved]
    setSaved(updated)
    localStorage.setItem('sacco_fields', JSON.stringify(updated))
    setPoints([])
    setStatus('Field saved! Start a new measurement.')
    setView('history')
  }

  const fmt2 = (n: number) => n.toFixed(2)

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 20, color: 'white', marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>📍 GPS Field Measurement</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Walk your farm boundary to measure area in acres</p>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {(['measure','history'] as const).map(tab => (
          <button key={tab} onClick={() => setView(tab)}
            style={{ flex: 1, background: view === tab ? 'white' : 'transparent', border: 'none', borderRadius: 10, padding: '10px 4px', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: view === tab ? '#1a6b3a' : '#6b7280' }}>
            {tab === 'measure' ? '📐 Measure' : `📋 Saved (${saved.length})`}
          </button>
        ))}
      </div>

      {view === 'measure' && (
        <>
          {/* Field name */}
          <div className="card" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Field / Farm Name</span>
              <input value={fieldName} onChange={e => setFieldName(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </label>
          </div>

          {/* Status bar */}
          <div style={{ background: error ? '#fee2e2' : '#f0fdf4', border: `1px solid ${error ? '#fca5a5' : '#86efac'}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: error ? '#dc2626' : '#166534', fontWeight: 500 }}>
              {error || status}
            </p>
            {currentPos && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                Lat: {currentPos.lat.toFixed(6)} · Lng: {currentPos.lng.toFixed(6)} · ±{Math.round(currentPos.accuracy)}m
              </p>
            )}
          </div>

          {/* GPS Controls */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {!watching ? (
              <button onClick={startWatching}
                style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                📡 Get Location
              </button>
            ) : (
              <button onClick={stopWatching}
                style={{ flex: 1, background: '#6b7280', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                ⏸ Pause GPS
              </button>
            )}
            <button onClick={addPoint} disabled={!currentPos}
              style={{ flex: 2, background: currentPos ? '#1a6b3a' : '#9ca3af', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 800, fontSize: 16, cursor: currentPos ? 'pointer' : 'default' }}>
              📌 Mark Corner {points.length + 1}
            </button>
          </div>

          {/* How to use */}
          {points.length === 0 && (
            <div className="card" style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fcd34d' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#92400e', fontSize: 14 }}>📖 How to use:</p>
              {[
                'Tap "Get Location" and wait for GPS to lock (green bar)',
                'Stand at a corner of your field, tap "Mark Corner"',
                'Walk to the next corner, wait for GPS, tap "Mark Corner" again',
                'Repeat for all corners (minimum 3)',
                'Your field area calculates automatically',
                'Tap "Save Field" when done',
              ].map((step, i) => (
                <p key={i} style={{ margin: '4px 0', fontSize: 13, color: '#78350f' }}>{i+1}. {step}</p>
              ))}
            </div>
          )}

          {/* Points list */}
          {points.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>📌 Corners Marked ({points.length})</p>
                <button onClick={removeLastPoint}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 0 }}>
                  Undo Last
                </button>
              </div>
              {points.map((pt, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < points.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>📍 {pt.label}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)} (±{Math.round(pt.accuracy)}m)</span>
                </div>
              ))}
            </div>
          )}

          {/* Area display */}
          {points.length >= 3 && (
            <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 20, marginBottom: 16, color: 'white', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', opacity: 0.8, fontSize: 14 }}>Calculated Field Area</p>
              <h1 style={{ margin: '0 0 4px', fontSize: 40, fontWeight: 900 }}>{fmt2(area_acres)}</h1>
              <p style={{ margin: '0 0 16px', fontSize: 18, opacity: 0.9 }}>acres</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div>
                  <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>Square Metres</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{Math.round(area_sqm).toLocaleString()} m²</p>
                </div>
                <div>
                  <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>Perimeter</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{fmt2(perimeter_m / 1000)} km</p>
                </div>
              </div>

              <button onClick={saveMeasurement}
                style={{ marginTop: 16, background: '#d4a017', color: '#1a1a1a', border: 'none', borderRadius: 14, padding: '14px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer', width: '100%' }}>
                💾 Save Field Measurement
              </button>
            </div>
          )}

          {points.length < 3 && points.length > 0 && (
            <div style={{ textAlign: 'center', padding: 12, color: '#6b7280', fontSize: 14 }}>
              Need {3 - points.length} more corner{3 - points.length > 1 ? 's' : ''} to calculate area
            </div>
          )}
        </>
      )}

      {view === 'history' && (
        <>
          {saved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 64 }}>🌾</div>
              <p style={{ color: '#6b7280', marginTop: 12 }}>No saved measurements yet. Measure your first field!</p>
              <button onClick={() => setView('measure')}
                style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 14, padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 12 }}>
                📐 Start Measuring
              </button>
            </div>
          ) : (
            saved.map(field => (
              <div key={field.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{field.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>📅 {field.date} · {field.points.length} corners</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 24, color: '#1a6b3a' }}>{fmt2(field.area_acres)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>acres</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280' }}>
                  <span>📐 {Math.round(field.area_sqm).toLocaleString()} m²</span>
                  <span>🔲 {fmt2(field.perimeter_m / 1000)} km boundary</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
