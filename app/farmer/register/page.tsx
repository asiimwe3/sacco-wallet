'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'language' | 'personal' | 'farm' | 'gps' | 'consent' | 'done'

const CROPS = ['Maize 🌽','Beans 🫘','Coffee ☕','Groundnuts 🥜','Cassava 🥔','Banana 🍌','Sweet Potato 🍠','Sorghum 🌾','Tomatoes 🍅','Sunflower 🌻']

const STEPS: Step[] = ['language','personal','farm','gps','consent','done']

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')
  const [lang, setLang] = useState('english')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [form, setForm] = useState({
    full_name: '', phone: '', village: '', district: 'Kyenjojo',
    farm_size_acres: '', crops: [] as string[],
    gps_consent: false, gps_lat: '', gps_lng: '',
  })

  const stepNum = STEPS.indexOf(step)
  const progress = (stepNum / (STEPS.length - 1)) * 100

  // Auto-redirect countdown when on done step
  useEffect(() => {
    if (step !== 'done') return
    // Save to localStorage so dashboard can greet farmer
    if (typeof window !== 'undefined') {
      if (form.full_name) localStorage.setItem('sacco_farmer_name', form.full_name)
      if (form.village) localStorage.setItem('sacco_farmer_village', form.village)
    }
    let c = 3
    setCountdown(3)
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(t)
        router.push('/farmer/dashboard')
      }
    }, 1000)
    return () => clearInterval(t)
  }, [step, router, form.full_name, form.village])

  const captureGPS = () => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setForm(f => ({ ...f, gps_lat: pos.coords.latitude.toFixed(6), gps_lng: pos.coords.longitude.toFixed(6) }))
          setGpsLoading(false)
        },
        () => setGpsLoading(false)
      )
    } else {
      setGpsLoading(false)
    }
  }

  const T = (en: string, rn: string, lg: string) =>
    lang === 'runyoro' ? rn : lang === 'luganda' ? lg : en

  const btn = { background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 17, cursor: 'pointer', width: '100%' } as const
  const inp = { width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '13px 16px', fontSize: 16, outline: 'none', background: 'white', boxSizing: 'border-box' } as const

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f2', padding: 16 }}>
      {/* Header */}
      {step !== 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {step !== 'language' && (
            <button onClick={() => setStep(STEPS[stepNum - 1])}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, minHeight: 0 }}>←</button>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              {T('Farmer Registration', 'Jimu — Omuhizi', 'Wandiika — Okulima')}
            </h2>
            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, marginTop: 8 }}>
              <div style={{ background: '#1a6b3a', borderRadius: 999, height: 6, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      )}

      {/* STEP: Language */}
      {step === 'language' && (
        <div>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Choose your preferred language:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { code:'english', label:'🇬🇧 English', sub:'English language' },
              { code:'runyoro', label:'🇺🇬 Runyoro', sub:'Olulimi lwa Bunyoro' },
              { code:'luganda', label:'🇺🇬 Luganda', sub:'Olulimi lwa Buganda' },
            ].map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setForm(f=>({...f, language: l.code} as typeof f)); localStorage.setItem('sacco_lang', l.code) }}
                style={{ background: lang === l.code ? '#1a6b3a' : 'white', color: lang === l.code ? 'white' : '#1a1a1a', border: `2px solid ${lang === l.code ? '#1a6b3a' : '#e5e7eb'}`, borderRadius: 16, padding: '20px 24px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{l.label}</p>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>{l.sub}</p>
                </div>
                {lang === l.code && <span style={{ marginLeft: 'auto', fontSize: 22 }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('personal')} style={{ ...btn, marginTop: 24 }}>
            {T('Continue →', 'Komeza →', 'Ddamu →')}
          </button>
        </div>
      )}

      {/* STEP: Personal */}
      {step === 'personal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: T('Full Name','Eizina Lyo Lyona','Erinnya Lyo'), key:'full_name', placeholder:'e.g. Amanya Katusiime', type:'text' },
            { label: T('Phone Number','Nomba ya Simu','Nomba ya Ssimu'), key:'phone', placeholder:'0700 123 456', type:'tel' },
            { label: T('Village','Kyaro','Kyalo'), key:'village', placeholder:'e.g. Butebo', type:'text' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>{field.label}</label>
              <input type={field.type} value={(form as Record<string,string>)[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder} style={inp} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>District</label>
            <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inp}>
              {['Kyenjojo','Kamwenge','Kabarole','Mubende','Kasese'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => setStep('farm')} disabled={!form.full_name || !form.phone || !form.village}
            style={{ ...btn, opacity: (!form.full_name || !form.phone || !form.village) ? 0.5 : 1 }}>
            {T('Continue →', 'Komeza →', 'Ddamu →')}
          </button>
        </div>
      )}

      {/* STEP: Farm */}
      {step === 'farm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {T('Farm Size (Acres)','Obukulu bw\'Eihindu (Acre)','Obunene bw\'Ennimiro (Acre)')}
            </label>
            <input type="number" value={form.farm_size_acres}
              onChange={e => setForm(f => ({ ...f, farm_size_acres: e.target.value }))}
              placeholder="e.g. 2.5" step="0.5" min="0.5" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              {T('Your Crops (select all that apply)','Ebihingwa Byo','Ebirimu Byo')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CROPS.map(crop => (
                <button key={crop} onClick={() => setForm(f => ({ ...f, crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop] }))}
                  style={{ background: form.crops.includes(crop) ? '#1a6b3a' : '#f3f4f6', color: form.crops.includes(crop) ? 'white' : '#374151', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 14, cursor: 'pointer' }}>
                  {crop}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('gps')} disabled={!form.farm_size_acres}
            style={{ ...btn, opacity: !form.farm_size_acres ? 0.5 : 1 }}>
            {T('Continue →', 'Komeza →', 'Ddamu →')}
          </button>
        </div>
      )}

      {/* STEP: GPS */}
      {step === 'gps' && (
        <div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#15803d', fontSize: 16 }}>📍 Farm Location (Optional)</p>
            <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
              {T('Sharing your farm location helps you qualify for larger loans. We only capture it once — never track you continuously.',
                'Hyerekeza ahantu h\'eihindu lyawe okunoosha enjigi nkuru. Tibagumire kukurikirira.',
                'Kiriza ennimiro yo okufunira enjigi ennene. Tukubiriraki.')}
            </p>
          </div>
          {form.gps_lat ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 12, marginBottom: 16, textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#16a34a', fontSize: 15 }}>✅ GPS Captured!</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{form.gps_lat}, {form.gps_lng}</p>
            </div>
          ) : (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ ...btn, background: gpsLoading ? '#6b7280' : '#2563eb', marginBottom: 12 }}>
              {gpsLoading ? '⏳ Finding location...' : '📍 Capture GPS Location'}
            </button>
          )}
          <button onClick={() => setStep('consent')} style={{ ...btn, background: form.gps_lat ? '#1a6b3a' : '#6b7280', marginBottom: 8 }}>
            {form.gps_lat ? T('Continue →','Komeza →','Ddamu →') : T('Skip GPS →','Siga GPS →','Lekawo GPS →')}
          </button>
        </div>
      )}

      {/* STEP: Consent */}
      {step === 'consent' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>
            {T('Review & Agree','Reba & Kwemera','Kebera & Kwemera')}
          </h3>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {[
              ['👤', T('Name','Eizina','Erinnya'), form.full_name],
              ['📱', T('Phone','Simu','Ssimu'), form.phone],
              ['📍', T('Village','Kyaro','Kyalo'), `${form.village}, ${form.district}`],
              ['🌾', T('Farm Size','Eihindu','Ennimiro'), `${form.farm_size_acres} acres`],
              ['🌱', T('Crops','Ebihingwa','Ebirimu'), form.crops.slice(0,3).join(', ') || 'None selected'],
            ].map(([icon, label, val]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 14, color: '#6b7280' }}>{icon} {label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{val}</span>
              </div>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.gps_consent} onChange={e => setForm(f => ({ ...f, gps_consent: e.target.checked }))}
              style={{ marginTop: 3, width: 20, height: 20, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              {T('I agree to SACCO membership terms and allow my data to be used for loan and savings services.',
                'Nzigirira amategeko ga SACCO nkwata obusingye bwange kusaba enjigi nokundika.',
                'Nkiriza amateeka ga SACCO era nkiriza data yange okukozesebwa mu bijja by\'enjigi.')}
            </span>
          </label>
          <button onClick={() => setStep('done')} disabled={!form.gps_consent} style={{ ...btn, opacity: !form.gps_consent ? 0.5 : 1 }}>
            ✅ {T('Create My Account','Kora Akaunti Yange','Kola Akaunti Yange')}
          </button>
        </div>
      )}

      {/* STEP: Done — auto-redirect to dashboard */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900 }}>
            {T('Registration Complete!','Wajimu!','Wandiise!')}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            {T('Your details have been saved successfully.','Obusingye bwawe bubikiriwe.','Ebyofaako byo bisinziiriddwa.')}
          </p>

          {/* Countdown auto-redirect card */}
          <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', borderRadius: 20, padding: 24, color: 'white', marginBottom: 20 }}>
            <div style={{ fontSize: 52, fontWeight: 900 }}>{countdown}</div>
            <p style={{ margin: '4px 0 12px', fontSize: 16, fontWeight: 700, opacity: 0.9 }}>
              {T('Opening your dashboard...','Gura dashboard yawe...','Genda ku dashboard...')}
            </p>
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 99, height: 8 }}>
              <div style={{ background: '#d4a017', height: '100%', borderRadius: 99, width: `${((3 - countdown) / 3) * 100}%`, transition: 'width 0.9s ease' }} />
            </div>
          </div>

          <button onClick={() => router.push('/farmer/dashboard')}
            style={{ ...btn, fontSize: 18, padding: '18px', marginBottom: 16 }}>
            🏠 {T('Go to My Dashboard','Jinja ku Dashboard','Genda ku Dashboard')}
          </button>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: 14 }}>
            <p style={{ fontWeight: 700, color: '#1d4ed8', margin: '0 0 4px' }}>Next steps:</p>
            <p style={{ color: '#1d4ed8', fontSize: 13, margin: 0 }}>
              {T('A SACCO field officer will visit your farm within 5–7 days to verify and activate your wallet.',
                'Omurusha wa SACCO azaza kuhinzira lyawe mu mazoba 5-7.',
                'Omukozi wa SACCO ajja ku nnimiro yo mu nnaku 5-7.')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
