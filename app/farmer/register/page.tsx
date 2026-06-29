'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'language' | 'personal' | 'farm' | 'gps' | 'consent' | 'done'
const STEPS: Step[] = ['language','personal','farm','gps','consent','done']
const CROPS = ['Maize 🌽','Beans 🫘','Coffee ☕','Groundnuts 🥜','Cassava 🥔','Banana 🍌','Sweet Potato 🍠','Sorghum 🌾','Tomatoes 🍅','Sunflower 🌻']

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
  const T = (en: string, rn: string, lg: string) =>
    lang === 'runyoro' ? rn : lang === 'luganda' ? lg : en

  useEffect(() => {
    if (step !== 'done') return
    if (typeof window !== 'undefined') {
      if (form.full_name) localStorage.setItem('sacco_farmer_name', form.full_name)
      if (form.village) localStorage.setItem('sacco_farmer_village', form.village)
    }
    let c = 3
    setCountdown(3)
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) { clearInterval(t); router.push('/farmer/dashboard') }
    }, 1000)
    return () => clearInterval(t)
  }, [step, router, form.full_name, form.village])

  const captureGPS = () => {
    setGpsLoading(true)
    navigator.geolocation?.getCurrentPosition(
      pos => { setForm(f => ({ ...f, gps_lat: pos.coords.latitude.toFixed(6), gps_lng: pos.coords.longitude.toFixed(6) })); setGpsLoading(false) },
      () => setGpsLoading(false)
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', padding: '0 0 40px' }}>
      {/* Header */}
      {step !== 'done' && (
        <div style={{ background: 'white', borderBottom: '1px solid #e2ded6', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          {step !== 'language' && (
            <button onClick={() => setStep(STEPS[stepNum - 1])}
              style={{ background: 'none', border: 'none', fontSize: 22, color: '#1a4731', cursor: 'pointer', padding: 0, minHeight: 0 }}>←</button>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a4731', marginBottom: 6 }}>
              {T('Farmer Registration','Jimu — Omuhizi','Wandiika — Okulima')}
            </p>
            <div style={{ background: '#e2ded6', borderRadius: 99, height: 4 }}>
              <div style={{ background: '#1a4731', height: 4, borderRadius: 99, width: `${(stepNum / (STEPS.length - 1)) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: '#8a9a8e', fontWeight: 600 }}>{stepNum}/{STEPS.length - 1}</span>
        </div>
      )}

      <div style={{ padding: '28px 20px 0' }}>

        {/* LANGUAGE */}
        {step === 'language' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, background: '#1a4731', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌾</div>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#1a4731' }}>Kyenjojo SACCO</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
              {T('Join the SACCO','Jimu ku SACCO','Yingira ku SACCO')}
            </h2>
            <p style={{ color: '#5a6a5e', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
              {T('Choose your preferred language to get started.','Hora olulimi lwawe okuteera omutyere.','Bora olulimi lwo okuteeka.')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                { code:'english', label:'🇬🇧 English', sub:'English language' },
                { code:'runyoro', label:'🇺🇬 Runyoro', sub:'Olulimi lwa Bunyoro' },
                { code:'luganda', label:'🇺🇬 Luganda', sub:'Olulimi lwa Buganda' },
              ].map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem('sacco_lang', l.code) }}
                  style={{ background: lang === l.code ? '#1a4731' : 'white', color: lang === l.code ? 'white' : '#1a1a1a', border: `1.5px solid ${lang === l.code ? '#1a4731' : '#e2ded6'}`, borderRadius: 16, padding: '18px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{l.label}</p>
                    <p style={{ fontSize: 13, opacity: 0.7 }}>{l.sub}</p>
                  </div>
                  {lang === l.code && <span style={{ fontSize: 18 }}>✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setStep('personal')} className="btn-primary">
              {T('Get started →','Tandika →','Tandika →')}
            </button>
          </div>
        )}

        {/* PERSONAL INFO */}
        {step === 'personal' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{T('Personal Info','Obusingye Bwawe','Ebyofaako Byo')}</h2>
            <p style={{ color: '#5a6a5e', fontSize: 14, marginBottom: 24 }}>{T('Tell us about yourself.','Tubuulire ebyawe.','Tubuulire ebyofu.')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {[
                { label: T('Full Name','Eizina Lyo Lyona','Erinnya Lyo'), key:'full_name', placeholder:'e.g. Amanya Katusiime', type:'text' },
                { label: T('Phone Number','Nomba ya Simu','Nomba ya Ssimu'), key:'phone', placeholder:'0700 123 456', type:'tel' },
                { label: T('Village','Kyaro','Kyalo'), key:'village', placeholder:'e.g. Butebo', type:'text' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input type={field.type} value={(form as Record<string,string>)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} className="input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>District</label>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="input">
                  {['Kyenjojo','Kamwenge','Kabarole','Mubende','Kasese'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setStep('farm')} disabled={!form.full_name || !form.phone || !form.village}
              className="btn-primary" style={{ opacity: (!form.full_name || !form.phone || !form.village) ? 0.4 : 1 }}>
              {T('Continue →','Komeza →','Ddamu →')}
            </button>
          </div>
        )}

        {/* FARM INFO */}
        {step === 'farm' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{T('Your Farm','Eihindu Lyawe','Ennimiro Yo')}</h2>
            <p style={{ color: '#5a6a5e', fontSize: 14, marginBottom: 24 }}>{T('Tell us about your farm.','Tubuulire eihindu lyawe.','Tubuulire ennimiro yo.')}</p>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {T('Farm Size (Acres)','Obukulu (Acre)','Obunene (Acre)')}
              </label>
              <input type="number" value={form.farm_size_acres}
                onChange={e => setForm(f => ({ ...f, farm_size_acres: e.target.value }))}
                placeholder="e.g. 2.5" className="input" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
                {T('What do you grow?','Ohingira ki?','Olima ki?')}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CROPS.map(crop => (
                  <button key={crop} onClick={() => setForm(f => ({ ...f, crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop] }))}
                    style={{ background: form.crops.includes(crop) ? '#1a4731' : 'white', color: form.crops.includes(crop) ? 'white' : '#374151', border: `1.5px solid ${form.crops.includes(crop) ? '#1a4731' : '#e2ded6'}`, borderRadius: 99, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 0 }}>
                    {crop}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('gps')} disabled={!form.farm_size_acres}
              className="btn-primary" style={{ opacity: !form.farm_size_acres ? 0.4 : 1 }}>
              {T('Continue →','Komeza →','Ddamu →')}
            </button>
          </div>
        )}

        {/* GPS */}
        {step === 'gps' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📍 {T('Farm Location','Ahantu h\'Eihindu','Ahantu h\'Ennimiro')}</h2>
            <p style={{ color: '#5a6a5e', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              {T('Optional — helps you qualify for larger loans. We only record this once, never continuously.',
                'Si ngenzaho — nakukiriza okusaba enjigi nkuru. Tibatukurikira.',
                'Ssi bategekefu — okukuyamba okusaba enjigi ennene. Tetukurikira.')}
            </p>
            {form.gps_lat ? (
              <div style={{ background: '#e8f5ee', borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#1a4731', fontSize: 15 }}>✅ {T('Location captured!','Ahantu habonerwa!','Ahantu habonerwa!')}</p>
                <p style={{ fontSize: 13, color: '#5a6a5e', marginTop: 4 }}>{form.gps_lat}, {form.gps_lng}</p>
              </div>
            ) : (
              <button onClick={captureGPS} disabled={gpsLoading}
                style={{ display: 'block', width: '100%', background: gpsLoading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: 999, padding: '16px', fontSize: 16, fontWeight: 600, cursor: gpsLoading ? 'default' : 'pointer', marginBottom: 12 }}>
                {gpsLoading ? '⏳ Finding location...' : '📍 Capture GPS Location'}
              </button>
            )}
            <button onClick={() => setStep('consent')} className="btn-primary" style={{ marginBottom: 8 }}>
              {form.gps_lat ? T('Continue →','Komeza →','Ddamu →') : T('Skip & Continue →','Siga & Komeza →','Siga & Ddamu →')}
            </button>
          </div>
        )}

        {/* CONSENT */}
        {step === 'consent' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{T('Review & Confirm','Reba & Kwemera','Kebera & Kwemera')}</h2>
            <p style={{ color: '#5a6a5e', fontSize: 14, marginBottom: 20 }}>{T('Check your details before creating your account.','Reba obusingye bwawe mbere y\'okuhaaho akaunti.','Kebera ebyofaako byo nga tonnawandiika.')}</p>
            <div className="card" style={{ marginBottom: 20 }}>
              {[
                ['👤', T('Name','Eizina','Erinnya'), form.full_name],
                ['📱', T('Phone','Simu','Ssimu'), form.phone],
                ['📍', T('Village','Kyaro','Kyalo'), `${form.village}, ${form.district}`],
                ['🌾', T('Farm','Eihindu','Ennimiro'), `${form.farm_size_acres} acres`],
                ['🌱', T('Crops','Ebihingwa','Ebirimu'), form.crops.slice(0,3).join(', ') || T('Not specified','Bitaragiwe','Ebitabaddewo')],
              ].map(([icon, label, val]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                  <span style={{ color: '#5a6a5e', fontSize: 14 }}>{icon} {label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', textAlign: 'right', maxWidth: '55%' }}>{val}</span>
                </div>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.gps_consent} onChange={e => setForm(f => ({ ...f, gps_consent: e.target.checked }))}
                style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0, accentColor: '#1a4731' }} />
              <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                {T('I agree to SACCO membership terms and allow my data to be used for loan and savings services.',
                  'Nzigirira amategeko ga SACCO nkwata obusingye bwange kusaba enjigi nokundika.',
                  'Nkiriza amateeka ga SACCO era nkiriza data yange okukozesebwa mu bijja by\'enjigi.')}
              </span>
            </label>
            <button onClick={() => setStep('done')} disabled={!form.gps_consent}
              className="btn-primary" style={{ opacity: !form.gps_consent ? 0.4 : 1 }}>
              ✅ {T('Create My Account','Kora Akaunti Yange','Kola Akaunti Yange')}
            </button>
          </div>
        )}

        {/* DONE — auto-redirect */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
              {T('Welcome to the SACCO!','Karibu ku SACCO!','Tukusembeza ku SACCO!')}
            </h2>
            <p style={{ color: '#5a6a5e', fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
              {T('Your account has been created. Opening your dashboard...','Akaunti yawe eza okukozesebwa. Tugura dashboard yawe...','Akaunti yo etondeddwa. Genda ku dashboard...')}
            </p>
            {/* Countdown */}
            <div style={{ background: '#1a4731', borderRadius: 24, padding: '28px 24px', color: 'white', marginBottom: 24 }}>
              <div style={{ fontSize: 56, fontWeight: 900, marginBottom: 8 }}>{countdown}</div>
              <p style={{ opacity: 0.85, fontSize: 15, fontWeight: 600 }}>{T('Opening dashboard...','Gura dashboard...','Genda ku dashboard...')}</p>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, height: 6, marginTop: 16 }}>
                <div style={{ background: '#c8961e', height: '100%', borderRadius: 99, width: `${((3 - countdown) / 3) * 100}%`, transition: 'width 0.9s ease' }} />
              </div>
            </div>
            <button onClick={() => router.push('/farmer/dashboard')} className="btn-primary" style={{ fontSize: 17 }}>
              🏠 {T('Go to My Dashboard','Jinja ku Dashboard','Genda ku Dashboard')}
            </button>
            <div style={{ background: '#e8f5ee', borderRadius: 16, padding: 16, marginTop: 16 }}>
              <p style={{ fontWeight: 700, color: '#1a4731', marginBottom: 4, fontSize: 14 }}>Next steps:</p>
              <p style={{ color: '#256b47', fontSize: 13, lineHeight: 1.6 }}>
                {T('A SACCO field officer will visit your farm within 5–7 days to verify your details and activate your wallet.',
                  'Omurusha wa SACCO azaza kuhinzira lyawe mu mazoba 5-7.',
                  'Omukozi wa SACCO ajja ku nnimiro yo mu nnaku 5-7 okukakasa ebyofaako.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
