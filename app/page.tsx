'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const [lang, setLang] = useState('english')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || profile.role === 'field_officer') router.push('/admin')
      else router.push('/farmer/dashboard')
    }
  }, [user, profile, router])

  const T: Record<string, Record<string,string>> = {
    english: { title:'SACCO Wallet', sub:"Digital banking for Kyenjojo farmers", login:'Login', phone:'Phone Number', password:'Password', register:'New Farmer? Register', forgot:'Forgot password?', tagline:'Save. Borrow. Grow.', logging:'Logging in...' },
    runyoro: { title:'SACCO Wallet', sub:"Obusindi bw'Obuhinzi — Kyenjojo", login:'Injira', phone:'Ennamba y\'Esiimu', password:'Ekigambo Kyobujagwa', register:'Omuhizi Omushasha? Jimu', forgot:'Wibagiire ekigambo?', tagline:'Sindika. Gula. Hinda.', logging:'Onjira...' },
    luganda: { title:'SACCO Wallet', sub:"Ensimbi z'Abalimba — Kyenjojo", login:'Yingira', phone:'Ennamba y\'Simu', password:'Ekigambo Kyobukuumi', register:'Omulimu Omupya? Wandiika', forgot:'Ggwaana ekigambo?', tagline:'Leka. Saba. Grow.', logging:'Onjira...' },
  }
  const txt = T[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    // Try phone as email (supabase phone auth requires SMS — use email+phone hybrid)
    const emailGuess = phone.replace(/^0/, '256').replace(/^\+/, '') + '@saccomember.ug'
    const { error: err } = await supabase.auth.signInWithPassword({ email: emailGuess, password })
    if (err) {
      // Try plain email if user registered with email
      const { error: err2 } = await supabase.auth.signInWithPassword({ email: phone, password })
      if (err2) setError('Wrong phone/password. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a6b3a 0%,#0f4225 60%,#0a2e19 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      {/* Lang picker */}
      <div style={{ position:'absolute', top:16, right:16, display:'flex', gap:8 }}>
        {['english','runyoro','luganda'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang===l ? '#d4a017' : 'rgba(255,255,255,0.15)', color:'white', border:'none', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {l==='english' ? 'EN' : l==='runyoro' ? 'RN' : 'LG'}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'#d4a017', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:36 }}>🌾</div>
        <h1 style={{ color:'white', fontSize:28, fontWeight:800, margin:0 }}>{txt.title}</h1>
        <p style={{ color:'rgba(255,255,255,0.7)', marginTop:6, fontSize:14 }}>{txt.sub}</p>
        <p style={{ color:'#d4a017', fontWeight:700, fontSize:16, marginTop:4 }}>{txt.tagline}</p>
      </div>

      {/* Login form */}
      <form onSubmit={handleLogin} style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 }}>
        {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{error}</div>}
        <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={txt.phone}
          style={{ width:'100%', border:'2px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'14px 16px', fontSize:16, background:'rgba(255,255,255,0.1)', color:'white', outline:'none' }}
          autoComplete="username" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={txt.password}
          style={{ width:'100%', border:'2px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'14px 16px', fontSize:16, background:'rgba(255,255,255,0.1)', color:'white', outline:'none' }}
          autoComplete="current-password" required />
        <button type="submit" disabled={loading}
          style={{ background:'#d4a017', color:'#1a1a1a', border:'none', borderRadius:14, padding:'16px', fontWeight:800, fontSize:18, cursor:'pointer', opacity: loading ? 0.8 : 1 }}>
          🌾 {loading ? txt.logging : txt.login}
        </button>
        <Link href="/farmer/register" style={{ display:'block', background:'rgba(255,255,255,0.12)', color:'white', textAlign:'center', padding:'14px', borderRadius:14, fontWeight:600, fontSize:16, textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)' }}>
          ➕ {txt.register}
        </Link>
        <Link href="/farmer/forgot-password" style={{ textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none' }}>
          {txt.forgot}
        </Link>
        <Link href="/admin" style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:12, textDecoration:'none', marginTop:8 }}>
          ⚙️ Admin Login
        </Link>
      </form>

      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:32 }}>Kyenjojo SACCO • Privacy First • Offline Ready</p>
    </div>
  )
}
