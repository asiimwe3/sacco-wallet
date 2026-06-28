'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Price { id:string; crop:string; crop_runyoro:string|null; crop_luganda:string|null; price_per_kg:number; market_name:string; price_date:string }

const FALLBACK = [
  { id:'1', crop:'Maize', crop_runyoro:'Emboga y\'Obutunda', crop_luganda:'Kasooli', price_per_kg:850, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🌽', trend:'up', change:'+5%' },
  { id:'2', crop:'Beans', crop_runyoro:'Ebijanjalo', crop_luganda:'Ebijanjaalo', price_per_kg:2800, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🫘', trend:'stable', change:'0%' },
  { id:'3', crop:'Groundnuts', crop_runyoro:'Emfuta', crop_luganda:'Ebinyebwa', price_per_kg:4200, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🥜', trend:'up', change:'+8%' },
  { id:'4', crop:'Cassava', crop_runyoro:'Omuwogo', crop_luganda:'Muwogo', price_per_kg:450, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🥔', trend:'down', change:'-3%' },
  { id:'5', crop:'Coffee (Robusta)', crop_runyoro:'Ekahawa', crop_luganda:'Emwanyi', price_per_kg:5500, market_name:'Fort Portal', price_date: new Date().toISOString().slice(0,10), icon:'☕', trend:'up', change:'+12%' },
  { id:'6', crop:'Banana (Matooke)', crop_runyoro:'Embogo', crop_luganda:'Matooke', price_per_kg:700, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🍌', trend:'stable', change:'0%' },
  { id:'7', crop:'Sweet Potato', crop_runyoro:'Omugaati', crop_luganda:'Lumonde', price_per_kg:600, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🍠', trend:'up', change:'+4%' },
  { id:'8', crop:'Sorghum', crop_runyoro:'Oburo', crop_luganda:'Obulo', price_per_kg:1100, market_name:'Kyenjojo Town', price_date: new Date().toISOString().slice(0,10), icon:'🌾', trend:'down', change:'-2%' },
  { id:'9', crop:'Tomatoes', crop_runyoro:'Nyanya', crop_luganda:'Nyanya', price_per_kg:1800, market_name:'Fort Portal', price_date: new Date().toISOString().slice(0,10), icon:'🍅', trend:'up', change:'+15%' },
  { id:'10', crop:'Sunflower', crop_runyoro:'Embaya', crop_luganda:'Embaya', price_per_kg:1600, market_name:'Kamwenge', price_date: new Date().toISOString().slice(0,10), icon:'🌻', trend:'stable', change:'+1%' },
]
const CROP_ICONS: Record<string,string> = { 'Maize':'🌽','Beans':'🫘','Groundnuts':'🥜','Cassava':'🥔','Coffee (Robusta)':'☕','Banana (Matooke)':'🍌','Sweet Potato':'🍠','Sorghum':'🌾','Tomatoes':'🍅','Sunflower':'🌻' }

export default function Market() {
  const [prices, setPrices] = useState(FALLBACK)
  const [search, setSearch] = useState('')
  const [lang, setLang]     = useState('english')
  const [fromDB, setFromDB] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sacco_lang') || 'english'; setLang(saved)
    async function load() {
      const today = new Date().toISOString().slice(0,10)
      const { data } = await supabase.from('market_prices').select('*').gte('price_date', today).order('crop')
      if (data && data.length > 0) { setPrices(data as typeof FALLBACK); setFromDB(true) }
    }
    load()
  }, [])

  const filtered = prices.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()))
  const name = (p: typeof FALLBACK[0]) => lang==='runyoro' && p.crop_runyoro ? p.crop_runyoro : lang==='luganda' && p.crop_luganda ? p.crop_luganda : p.crop

  return (
    <div style={{ padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>🛒 {lang==='runyoro' ? "Ebiciro by'Obutungo" : lang==='luganda' ? "Bbeeyi z'Obutungo" : 'Market Prices'}</h2>
          <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>📅 {fromDB ? 'Live prices' : 'Cached prices'} • Kyenjojo Area</p>
        </div>
      </div>

      {/* Trending alert */}
      <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:12, padding:12, marginBottom:16 }}>
        <p style={{ margin:0, fontWeight:700, color:'#92400e', fontSize:14 }}>🔥 Trending: Coffee is up 12%!</p>
        <p style={{ margin:'2px 0 0', fontSize:13, color:'#78350f' }}>Best time to sell at Fort Portal market (UGX 5,500/kg)</p>
      </div>

      <div style={{ position:'relative', marginBottom:16 }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:18 }}>🔍</span>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search crops..."
          style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'12px 12px 12px 40px', fontSize:16, outline:'none', background:'white' }} />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:36 }}>{CROP_ICONS[item.crop] || '🌿'}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ margin:0, fontWeight:700, fontSize:15 }}>{name(item)}</p>
                <p style={{ margin:0, fontWeight:800, fontSize:16, color:'#1a6b3a' }}>UGX {item.price_per_kg.toLocaleString()}<span style={{ fontSize:12, fontWeight:500, color:'#6b7280' }}>/kg</span></p>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ color:'#6b7280', fontSize:13 }}>📍 {item.market_name}</span>
                <span style={{ fontSize:13, color:'#6b7280' }}>📅 {item.price_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
