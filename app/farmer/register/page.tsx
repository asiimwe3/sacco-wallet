'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'language' | 'personal' | 'farm' | 'gps' | 'consent' | 'done'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')
  const [lang, setLang] = useState('english')
  const [form, setForm] = useState({
    full_name: '', phone: '', village: '', district: '',
    farm_size_acres: '', crops: [] as string[],
    gps_consent: false, gps_lat: '', gps_lng: '',
    language: 'english'
  })
  const [gpsLoading, setGpsLoading] = useState(false)

  const T: Record<string, string> = {
    english: { title: 'Register as Farmer', next: 'Continue', back: 'Back', submit: 'Create Account', done: 'Registration Complete!' }[lang] || '',
  }

  const crops = ['Maize 🌽', 'Beans 🫘', 'Coffee ☕', 'Groundnuts 🥜', 'Cassava 🥔', 'Banana 🍌', 'Sweet Potato 🍠', 'Sorghum 🌾', 'Tomatoes 🍅', 'Sunflower 🌻']

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

  const btnStyle = { background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%' }
  const inputStyle = { width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '13px 16px', fontSize: 16, outline: 'none', background: 'white' }

  const steps: Step[] = ['language', 'personal', 'farm', 'gps', 'consent', 'done']
  const stepNum = steps.indexOf(step)
  const progress = (stepNum / (steps.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f2', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {step !== 'language' && step !== 'done' && (
          <button onClick={() => setStep(steps[stepNum - 1] as Step)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4 }}>←</button>
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            {lang === 'runyoro' ? 'Jimu - Omuhizi' : lang === 'luganda' ? 'Wandiika - Okulima' : 'Farmer Registration'}
          </h2>
          {step !== 'language' && step !== 'done' && (
            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, marginTop: 8 }}>
              <div style={{ background: '#1a6b3a', borderRadius: 999, height: 6, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          )}
        </div>
      </div>

      {/* Step: Language */}
      {step === 'language' && (
        <div>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Choose your preferred language / Hora olulimi lwo / Bora lugha yako:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { code: 'english', label: '🇬🇧 English', sub: 'English language' },
              { code: 'runyoro', label: '🇺🇬 Runyoro', sub: 'Olulimi lwa Bunyoro' },
              { code: 'luganda', label: '🇺🇬 Luganda', sub: 'Olulimi lwa Buganda' },
            ].map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setForm(f => ({ ...f, language: l.code })); localStorage.setItem('sacco_lang', l.code) }}
                style={{ background: lang === l.code ? '#1a6b3a' : 'white', color: lang === l.code ? 'white' : '#1a1a1a', border: '2px solid', borderColor: lang === l.code ? '#1a6b3a' : '#e5e7eb', borderRadius: 16, padding: '20px 24px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{l.label}</p>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>{l.sub}</p>
                </div>
                {lang === l.code && <span style={{ marginLeft: 'auto', fontSize: 22 }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('personal')} style={{ ...btnStyle, marginTop: 24 }}>
            {lang === 'runyoro' ? 'Komeza →' : lang === 'luganda' ? 'Ddamu →' : 'Continue →'}
          </button>
        </div>
      )}

      {/* Step: Personal */}
      {step === 'personal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {lang === 'runyoro' ? 'Eizina Lyo Lyona' : lang === 'luganda' ? 'Erinnya Lyo' : 'Full Name'}
            </label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. Amanya Katusiime" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {lang === 'runyoro' ? 'Nomba ya Simu' : lang === 'luganda' ? 'Nomba ya Ssimu' : 'Phone Number'}
            </label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. 0700123456" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {lang === 'runyoro' ? 'Kyaro' : lang === 'luganda' ? 'Kyalo' : 'Village'}
            </label>
            <input value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
              placeholder="e.g. Butebo" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>District</label>
            <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inputStyle}>
              <option value="">Select district...</option>
              <option>Kyenjojo</option>
              <option>Kamwenge</option>
              <option>Kabarole</option>
              <option>Mubende</option>
              <option>Kasese</option>
            </select>
          </div>
          <button onClick={() => setStep('farm')} disabled={!form.full_name || !form.phone || !form.village} style={{ ...btnStyle, opacity: !form.full_name || !form.phone || !form.village ? 0.5 : 1 }}>
            {lang === 'runyoro' ? 'Komeza →' : lang === 'luganda' ? 'Ddamu →' : 'Continue →'}
          </button>
        </div>
      )}

      {/* Step: Farm */}
      {step === 'farm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              {lang === 'runyoro' ? 'Obukulu bw\'Eihindu (Acre)' : lang === 'luganda' ? 'Obunene bw\'Ennimiro (Acre)' : 'Farm Size (Acres)'}
            </label>
            <input type="number" value={form.farm_size_acres} onChange={e => setForm(f => ({ ...f, farm_size_acres: e.target.value }))}
              placeholder="e.g. 2.5" step="0.5" min="0.5" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              {lang === 'runyoro' ? 'Ebihingwa Byo' : lang === 'luganda' ? 'Ebirimu Byo' : 'Your Crops (select all that apply)'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {crops.map(crop => (
                <button key={crop} onClick={() => setForm(f => ({ ...f, crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop] }))}
                  style={{ background: form.crops.includes(crop) ? '#1a6b3a' : '#f3f4f6', color: form.crops.includes(crop) ? 'white' : '#374151', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                  {crop}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('gps')} disabled={!form.farm_size_acres} style={{ ...btnStyle, opacity: !form.farm_size_acres ? 0.5 : 1 }}>
            {lang === 'runyoro' ? 'Komeza →' : lang === 'luganda' ? 'Ddamu →' : 'Continue →'}
          </button>
        </div>
      )}

      {/* Step: GPS */}
      {step === 'gps' && (
        <div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#15803d', fontSize: 16 }}>📍 Farm Location (Optional)</p>
            <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
              {lang === 'runyoro'
                ? 'Hyerekeza ahantu h\'eihindu lyawe okunoosha enjigi nkuru. Tibagumire kukurikirira — buri muntu omwene nkorana eriyo.'
                : lang === 'luganda'
                ? 'Kiriza ennimiro yo okufunira enjigi ennene. Tukubiriraki — buli omu ayagala kuyingira.'
                : 'Sharing your farm location helps you qualify for larger loans. This is optional and we will never track you continuously — only used for loan verification.'}
            </p>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', fontWeight: 500 }}>
              🔒 Privacy Promise: Your location is captured ONCE during registration. We never track you in real time. Data used only for loan eligibility verification.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'white', border: '2px solid #e5e7eb', borderRadius: 16, padding: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.gps_consent} onChange={e => setForm(f => ({ ...f, gps_consent: e.target.checked }))} style={{ width: 24, height: 24, accentColor: '#1a6b3a' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>I consent to GPS location capture</p>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>I understand how my data will be used</p>
            </div>
          </label>

          {form.gps_consent && (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ width: '100%', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}>
              {gpsLoading ? '📡 Getting location...' : form.gps_lat ? `✅ Location captured (${form.gps_lat}, ${form.gps_lng})` : '📍 Capture Farm Location'}
            </button>
          )}

          <button onClick={() => setStep('consent')} style={btnStyle}>
            {form.gps_consent ? 'Continue →' : 'Skip & Continue →'}
          </button>
        </div>
      )}

      {/* Step: Consent */}
      {step === 'consent' && (
        <div>
          <h3 style={{ margin: '0 0 16px' }}>📋 Terms & Data Usage</h3>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 20, fontSize: 14, lineHeight: 1.7, color: '#374151', border: '1px solid #e5e7eb' }}>
            <p><strong>What data we collect:</strong> Name, phone, village, farm size, savings, loan records, and (if consented) GPS location.</p>
            <p><strong>How we use it:</strong> To manage your savings account, process loan applications, and calculate your credit score.</p>
            <p><strong>We do NOT:</strong> Sell your data, track your movements, or share information without your permission.</p>
            <p><strong>Your rights:</strong> You can request to see, correct, or delete your data at any time by visiting our SACCO office in Kyenjojo Town.</p>
            <p><strong>Security:</strong> All data is encrypted and stored securely.</p>
          </div>
          <button onClick={() => setStep('done')}
            style={{ ...btnStyle, background: '#1a6b3a' }}>
            ✅ I Agree — Create My Account
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>By registering, you confirm you are 18+ and agree to SACCO membership terms.</p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>
            {lang === 'runyoro' ? 'Wajimu!' : lang === 'luganda' ? 'Wandiise!' : 'Registration Complete!'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 8 }}>Welcome to Kyenjojo SACCO, <strong>{form.full_name}</strong>!</p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 32 }}>Your account will be activated within 24 hours. Visit the SACCO office in Kyenjojo Town to complete verification.</p>
          <button onClick={() => router.push('/farmer/dashboard')} style={btnStyle}>
            🏠 Go to My Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
