'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'language' | 'personal' | 'farm' | 'gps' | 'consent' | 'done'
const CROPS = ['Maize 🌽','Beans 🫘','Coffee ☕','Groundnuts 🥜','Cassava 🥔','Banana 🍌','Sweet Potato 🍠','Sorghum 🌾','Tomatoes 🍅','Sunflower 🌻']
const STEPS: Step[] = ['language','personal','farm','gps','consent','done']

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('language')
  const [lang, setLang] = useState('english')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [form, setForm] = useState({
    full_name: '', phone: '', password: '', village: '', district: 'Kyenjojo',
    farm_size_acres: '', crops: [] as string[],
    gps_consent: false, gps_lat: '', gps_lng: '',
  })

  const stepNum = STEPS.indexOf(step)
  const progress = (stepNum / (STEPS.length - 1)) * 100

  useEffect(() => {
    if (step !== 'done') return
    let c = 3; setCountdown(3)
    const t = setInterval(() => { c--; setCountdown(c); if (c <= 0) { clearInterval(t); router.push('/farmer/dashboard') } }, 1000)
    return () => clearInterval(t)
  }, [step, router])

  const captureGPS = () => {
    setGpsLoading(true)
    navigator.geolocation?.getCurrentPosition(
      p => { setForm(f => ({ ...f, gps_lat: p.coords.latitude.toFixed(6), gps_lng: p.coords.longitude.toFixed(6) })); setGpsLoading(false) },
      () => setGpsLoading(false)
    )
  }

  async function handleRegister() {
    setLoading(true); setError('')
    const email = form.phone.replace(/^0/, '256').replace(/^\+/, '') + '@saccomember.ug'
    const { data, error: authErr } = await supabase.auth.signUp({
      email, password: form.password,
      options: { data: { full_name: form.full_name, role: 'farmer', preferred_language: lang, phone: form.phone } }
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    const userId = data.user?.id
    if (userId) {
      await supabase.from('profiles').update({
        full_name: form.full_name, phone_number: form.phone,
        village: form.village, district: form.district, preferred_language: lang,
      }).eq('id', userId)
      if (form.farm_size_acres || form.crops.length) {
        await supabase.from('farm_records').update({
          farm_size_acres: form.farm_size_acres ? parseFloat(form.farm_size_acres) : null,
          crops: form.crops, has_consented_to_gps: form.gps_consent,
          gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
          gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
        }).eq('farmer_id', userId)
      }
    }
    setLoading(false); setStep('done')
  }

  const T = (en: string, rn: string, lg: string) => lang==='runyoro' ? rn : lang==='luganda' ? lg : en
  const inp = { width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', background:'white', boxSizing:'border-box' } as const
  const btn = { background:'#1a6b3a', color:'white', border:'none', borderRadius:16, padding:'16px', fontWeight:700, fontSize:17, cursor:'pointer', width:'100%' } as const

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7f2', padding:16 }}>
      <div style={{ background:'#e5e7eb', borderRadius:999, height:6, marginBottom:24 }}>
        <div style={{ background:'#1a6b3a', borderRadius:999, height:6, width:`${progress}%`, transition:'width 0.4s' }} />
      </div>

      {step === 'language' && (
        <div>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>🌍 Choose Language</h2>
          <p style={{ color:'#6b7280', marginBottom:24 }}>Select your preferred language / Chagua lugha yako</p>
          {[['english','English','English'],['runyoro','Runyoro','Runyoro (Tooro)'],['luganda','Luganda','Luganda']].map(([code,label,sub]) => (
            <button key={code} onClick={() => { setLang(code); setStep('personal') }}
              style={{ width:'100%', background:'white', border:`2px solid ${lang===code ? '#1a6b3a' : '#e5e7eb'}`, borderRadius:16, padding:16, textAlign:'left', marginBottom:12, cursor:'pointer' }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{label}</div>
              <div style={{ color:'#6b7280', fontSize:13 }}>{sub}</div>
            </button>
          ))}
        </div>
      )}

      {step === 'personal' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>{T('👤 Your Details','👤 Ebikukwata','👤 Ebyawe')}</h2>
          {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:12, marginBottom:12, fontSize:14 }}>{error}</div>}
          {[
            { key:'full_name', placeholder: T('Full Name (e.g. Amanya Katusiime)','Amazina Yawe Gonna','Amannya Gange Gonna'), type:'text' },
            { key:'phone', placeholder: T('Phone Number (e.g. 0750414366)','Ennamba y\'Esiimu','Ennamba y\'Simu'), type:'tel' },
            { key:'password', placeholder: T('Create Password (min 6 chars)','Kora Ekigambo','Kola Ekigambo'), type:'password' },
            { key:'village', placeholder: T('Village / Sub-county','Omukaggo','Omukaaga'), type:'text' },
          ].map(f => (
            <input key={f.key} type={f.type} placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{ ...inp, marginBottom:12 }} />
          ))}
          <button onClick={() => { if (!form.full_name || !form.phone || !form.password) { setError('Fill all fields'); return }; setError(''); setStep('farm') }} style={btn}>
            {T('Next →','Okabye →','Sooka →')}
          </button>
        </div>
      )}

      {step === 'farm' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>{T('🌾 Farm Details','🌾 Eby\'Omurima','🌾 Eby\'Olugimbi')}</h2>
          <input type="number" placeholder={T('Farm size (acres)','Obunene bw\'Oburima (acres)','Obunene bw\'Olugimbi (acres)')}
            value={form.farm_size_acres} onChange={e => setForm(f=>({...f, farm_size_acres:e.target.value}))}
            style={{ ...inp, marginBottom:12 }} />
          <p style={{ fontWeight:600, marginBottom:12 }}>{T('Crops you grow:','Ebihingwa Byawe:','Ebimera Byawe:')}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
            {CROPS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, crops: f.crops.includes(c) ? f.crops.filter(x=>x!==c) : [...f.crops,c] }))}
                style={{ background: form.crops.includes(c) ? '#1a6b3a' : 'white', color: form.crops.includes(c) ? 'white' : '#374151', border:`2px solid ${form.crops.includes(c) ? '#1a6b3a' : '#e5e7eb'}`, borderRadius:999, padding:'8px 14px', fontSize:14, cursor:'pointer' }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('gps')} style={btn}>{T('Next →','Okabye →','Sooka →')}</button>
        </div>
      )}

      {step === 'gps' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>📍 {T('GPS Location','Ahali y\'Oburima','Ekifo ky\'Olugimbi')}</h2>
          <p style={{ color:'#6b7280', marginBottom:20 }}>{T('Optional: Record your farm GPS for verification.','Kyebazire: Orekebese GPS y\'Oburima bwawe.','Kyebazire: Tereka GPS y\'olugimbi lwo.')}</p>
          {form.gps_lat ? (
            <div style={{ background:'#dcfce7', borderRadius:12, padding:16, marginBottom:16 }}>
              <p style={{ margin:0, fontWeight:700, color:'#16a34a' }}>✅ GPS Captured</p>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#374151' }}>Lat: {form.gps_lat}, Lng: {form.gps_lng}</p>
            </div>
          ) : (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ ...btn, background:'#2563eb', marginBottom:16, opacity: gpsLoading ? 0.7 : 1 }}>
              {gpsLoading ? '📡 Getting location...' : '📍 Capture GPS'}
            </button>
          )}
          <button onClick={() => setStep('consent')} style={btn}>{T('Next →','Okabye →','Sooka →')}</button>
        </div>
      )}

      {step === 'consent' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:16 }}>✅ {T('Consent & Terms','Okukubalirwa','Okkiriziriza')}</h2>
          <div style={{ background:'white', borderRadius:16, padding:16, marginBottom:16, fontSize:14, lineHeight:1.6, color:'#374151' }}>
            <p>By registering, you agree that Kyenjojo SACCO may:</p>
            <p>1. Store your savings and loan records securely</p>
            <p>2. Use your GPS data for farm verification only</p>
            <p>3. Share anonymized data with partner agricultural agencies</p>
            <p>4. Send SMS notifications about your account</p>
          </div>
          <label style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:24, cursor:'pointer' }}>
            <input type="checkbox" checked={form.gps_consent} onChange={e=>setForm(f=>({...f,gps_consent:e.target.checked}))}
              style={{ width:20, height:20, marginTop:2 }} />
            <span style={{ fontSize:15 }}>I agree to the terms above and consent to GPS data use</span>
          </label>
          <button onClick={handleRegister} disabled={!form.gps_consent || loading}
            style={{ ...btn, opacity: (!form.gps_consent || loading) ? 0.6 : 1 }}>
            {loading ? '⏳ Registering...' : T('✅ Complete Registration','✅ Maliira Okwandika','✅ Maliriza Okuwandiika')}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign:'center', paddingTop:60 }}>
          <div style={{ fontSize:80, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#1a6b3a' }}>Welcome to SACCO!</h2>
          <p style={{ color:'#6b7280' }}>Nkwagala, {form.full_name.split(' ')[0]}!</p>
          <p style={{ color:'#9ca3af', fontSize:14, marginTop:16 }}>Redirecting in {countdown}s...</p>
        </div>
      )}
    </div>
  )
}
