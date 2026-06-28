'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [input, setInput] = useState('')
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const email = input.includes('@') ? input : input.replace(/^0/,'256').replace(/^\+/,'') + '@saccomember.ug'
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a6b3a,#0a2e19)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🔑</div>
          <h1 style={{ color:'white', fontSize:24, fontWeight:800, margin:0 }}>Forgot Password</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', marginTop:8 }}>Enter your phone number</p>
        </div>
        {sent ? (
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:16, padding:24, textAlign:'center', color:'white' }}>
            <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
            <h3 style={{ margin:0 }}>Reset link sent!</h3>
            <p style={{ opacity:0.8 }}>Check your email inbox.</p>
            <Link href="/" style={{ display:'block', marginTop:16, color:'#d4a017', fontWeight:700, textDecoration:'none' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:12, padding:10, marginBottom:12, fontSize:14 }}>{error}</div>}
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Phone (0750...) or Email" required
              style={{ width:'100%', border:'2px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'14px 16px', fontSize:16, background:'rgba(255,255,255,0.1)', color:'white', outline:'none', marginBottom:12 }} />
            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'#d4a017', color:'#1a1a1a', border:'none', borderRadius:14, padding:'16px', fontWeight:800, fontSize:18, cursor:'pointer', opacity:loading?0.7:1 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link href="/" style={{ display:'block', textAlign:'center', marginTop:16, color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  )
}
