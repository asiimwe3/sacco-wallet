'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'

type Step = 'language'|'personal'|'farm'|'gps'|'consent'|'done'
const CROPS = ['Maize 🌽','Beans 🫘','Coffee ☕','Groundnuts 🥜','Cassava 🥔','Banana 🍌','Sweet Potato 🍠','Sorghum 🌾','Tomatoes 🍅','Sunflower 🌻']
const STEPS: Step[] = ['language','personal','farm','gps','consent','done']

export default function Register() {
  const router = useRouter()
  const [step, setStep]   = useState<Step>('language')
  const [lang, setLang]   = useState('english')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [countdown, setCountdown]   = useState(3)
  const [form, setForm] = useState({
    full_name:'', phone:'', password:'', village:'', district:'Kyenjojo',
    farm_size_acres:'', crops:[] as string[], gps_consent:false, gps_lat:'', gps_lng:'',
  })

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

  function phoneToEmail(p: string) {
    return p.replace(/^0/, '256').replace(/^\+/, '') + '@saccomember.ug'
  }

  async function handleRegister() {
    setLoading(true); setError('')
    try {
      const email = phoneToEmail(form.phone)
      const { user } = await createUserWithEmailAndPassword(auth, email, form.password)
      const uid = user.uid
      const now = new Date().toISOString()

      // Create profile
      await setDoc(doc(db, COLLECTIONS.PROFILES, uid), {
        full_name: form.full_name, phone_number: form.phone, role: 'farmer',
        preferred_language: lang, village: form.village, district: form.district,
        is_active: true, joined_sacco_at: now, created_at: now,
      })

      // Create wallet
      await setDoc(doc(db, COLLECTIONS.WALLETS, uid), {
        user_id: uid, savings_balance: 0, balance: 0, shares_owned: 0,
        locked_amount: 0, currency: 'UGX', created_at: now,
      })

      // Create farm record
      await setDoc(doc(db, COLLECTIONS.FARM_RECORDS, uid), {
        farmer_id: uid,
        farm_size_acres: form.farm_size_acres ? parseFloat(form.farm_size_acres) : null,
        crops: form.crops,
        has_consented_to_gps: form.gps_consent,
        gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
        gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
        verification_status: 'pending', created_at: now,
      })

      // Seed credit score
      await setDoc(doc(db, COLLECTIONS.CREDIT_SCORES, `${uid}_initial`), {
        farmer_id: uid, score: 30, grade: 'D', max_loan_ugx: 200000,
        factors: { savings_balance: 0, repayment: 0, regularity: 0, shares: 0 },
        calculated_at: now,
      })

      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
    setLoading(false)
  }

  const T = (en:string,rn:string,lg:string) => lang==='runyoro' ? rn : lang==='luganda' ? lg : en
  const inp = { width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'13px 16px', fontSize:16, outline:'none', background:'white', boxSizing:'border-box' } as const
  const btn = { background:'#1a6b3a', color:'white', border:'none', borderRadius:16, padding:'16px', fontWeight:700, fontSize:17, cursor:'pointer', width:'100%' } as const
  const progress = (STEPS.indexOf(step)/(STEPS.length-1))*100

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7f2', padding:16 }}>
      <div style={{ background:'#e5e7eb', borderRadius:999, height:6, marginBottom:24 }}>
        <div style={{ background:'#1a6b3a', borderRadius:999, height:6, width:`${progress}%`, transition:'width 0.4s' }} />
      </div>

      {step==='language' && (
        <div>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>🌍 Choose Language</h2>
          <p style={{ color:'#6b7280', marginBottom:24 }}>Select your preferred language</p>
          {[['english','English'],['runyoro','Runyoro (Tooro)'],['luganda','Luganda']].map(([code,label]) => (
            <button key={code} onClick={() => { setLang(code); setStep('personal') }}
              style={{ width:'100%', background:'white', border:`2px solid ${lang===code?'#1a6b3a':'#e5e7eb'}`, borderRadius:16, padding:16, textAlign:'left', marginBottom:12, cursor:'pointer', fontSize:16, fontWeight:600 }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {step==='personal' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>{T('👤 Your Details','👤 Ebikukwata','👤 Ebyawe')}</h2>
          {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:12, marginBottom:12, fontSize:14 }}>{error}</div>}
          {[{key:'full_name',placeholder:'Full Name',type:'text'},{key:'phone',placeholder:'Phone (0750414366)',type:'tel'},{key:'password',placeholder:'Password (min 6 chars)',type:'password'},{key:'village',placeholder:'Village / Sub-county',type:'text'}].map(f => (
            <input key={f.key} type={f.type} placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]}
              onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} style={{ ...inp, marginBottom:12 }} />
          ))}
          <button onClick={() => { if(!form.full_name||!form.phone||!form.password){setError('Fill all fields');return}; setError(''); setStep('farm') }} style={btn}>
            {T('Next →','Okabye →','Sooka →')}
          </button>
        </div>
      )}

      {step==='farm' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>{T('🌾 Farm Details','🌾 Eby\'Omurima','🌾 Eby\'Olugimbi')}</h2>
          <input type="number" placeholder="Farm size (acres)" value={form.farm_size_acres}
            onChange={e=>setForm(f=>({...f,farm_size_acres:e.target.value}))} style={{ ...inp, marginBottom:12 }} />
          <p style={{ fontWeight:600, marginBottom:12 }}>Crops you grow:</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
            {CROPS.map(c => (
              <button key={c} onClick={() => setForm(f=>({...f,crops:f.crops.includes(c)?f.crops.filter(x=>x!==c):[...f.crops,c]}))}
                style={{ background:form.crops.includes(c)?'#1a6b3a':'white', color:form.crops.includes(c)?'white':'#374151', border:`2px solid ${form.crops.includes(c)?'#1a6b3a':'#e5e7eb'}`, borderRadius:999, padding:'8px 14px', fontSize:14, cursor:'pointer' }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('gps')} style={btn}>{T('Next →','Okabye →','Sooka →')}</button>
        </div>
      )}

      {step==='gps' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>📍 GPS Location</h2>
          <p style={{ color:'#6b7280', marginBottom:20 }}>Optional: Record your farm location</p>
          {form.gps_lat ? (
            <div style={{ background:'#dcfce7', borderRadius:12, padding:16, marginBottom:16 }}>
              <p style={{ margin:0, fontWeight:700, color:'#16a34a' }}>✅ GPS Captured</p>
              <p style={{ margin:'4px 0 0', fontSize:13 }}>Lat: {form.gps_lat}, Lng: {form.gps_lng}</p>
            </div>
          ) : (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ ...btn, background:'#2563eb', marginBottom:16, opacity:gpsLoading?0.7:1 }}>
              {gpsLoading ? '📡 Getting location...' : '📍 Capture GPS'}
            </button>
          )}
          <button onClick={() => setStep('consent')} style={btn}>{T('Next →','Okabye →','Sooka →')}</button>
        </div>
      )}

      {step==='consent' && (
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:16 }}>✅ Consent & Terms</h2>
          <div style={{ background:'white', borderRadius:16, padding:16, marginBottom:16, fontSize:14, lineHeight:1.7, color:'#374151' }}>
            <p style={{ margin:'0 0 8px' }}>By registering, you agree that Kyenjojo SACCO may:</p>
            <p style={{ margin:'0 0 6px' }}>1. Store your savings and loan records securely</p>
            <p style={{ margin:'0 0 6px' }}>2. Use GPS data for farm verification only</p>
            <p style={{ margin:'0 0 6px' }}>3. Share anonymized data with agricultural agencies</p>
            <p style={{ margin:0 }}>4. Send SMS notifications about your account</p>
          </div>
          <label style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:24, cursor:'pointer' }}>
            <input type="checkbox" checked={form.gps_consent} onChange={e=>setForm(f=>({...f,gps_consent:e.target.checked}))} style={{ width:20, height:20, marginTop:2 }} />
            <span style={{ fontSize:15 }}>I agree to the terms and consent to data use</span>
          </label>
          <button onClick={handleRegister} disabled={!form.gps_consent||loading}
            style={{ ...btn, opacity:(!form.gps_consent||loading)?0.6:1 }}>
            {loading ? '⏳ Registering...' : '✅ Complete Registration'}
          </button>
        </div>
      )}

      {step==='done' && (
        <div style={{ textAlign:'center', paddingTop:60 }}>
          <div style={{ fontSize:80 }}>🎉</div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#1a6b3a' }}>Welcome to SACCO!</h2>
          <p style={{ color:'#6b7280' }}>Nkwagala, {form.full_name.split(' ')[0]}!</p>
          <p style={{ color:'#9ca3af', fontSize:14, marginTop:16 }}>Redirecting in {countdown}s...</p>
        </div>
      )}
    </div>
  )
}
