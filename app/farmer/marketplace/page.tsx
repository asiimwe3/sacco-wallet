'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Listing { id:string; seller_name:string; seller_village:string; seller_type:string; title:string; description:string; price:number; unit:string; quantity_available:number; category:string; phone:string; whatsapp:string; posted_date:string; is_negotiable:boolean; delivery_available:boolean; rating:number|null; reviews:number|null }

const DEMO: Listing[] = [
  { id:'d1', seller_name:'Amanya Katusiime', seller_village:'Butebo', seller_type:'farmer', title:'Fresh Maize (Dry)', description:'Dry maize from our farm, clean and ready for grinding.', price:1800, unit:'kg', quantity_available:500, category:'crops', phone:'0750123456', whatsapp:'256750123456', posted_date:new Date().toISOString().slice(0,10), is_negotiable:true, delivery_available:false, rating:4.5, reviews:12 },
  { id:'d2', seller_name:'Birungi Joyce', seller_village:'Kyarusozi', seller_type:'farmer', title:'Irish Potatoes', description:'Fresh Irish potatoes, medium size. Harvested this week.', price:1200, unit:'kg', quantity_available:300, category:'crops', phone:'0782067425', whatsapp:'256782067425', posted_date:new Date().toISOString().slice(0,10), is_negotiable:true, delivery_available:true, rating:4.8, reviews:20 },
  { id:'d3', seller_name:'Kyenjojo Agro Traders', seller_village:'Kyenjojo Town', seller_type:'trader', title:'Hybrid Maize Seeds (H614)', description:'Certified hybrid maize seeds. High yield variety.', price:45000, unit:'2kg bag', quantity_available:50, category:'seeds', phone:'0772002326', whatsapp:'256772002326', posted_date:new Date().toISOString().slice(0,10), is_negotiable:false, delivery_available:true, rating:4.9, reviews:35 },
  { id:'d4', seller_name:'Kahwa Poultry Farm', seller_village:'Nyabuharwa', seller_type:'farmer', title:'Live Chickens (Kienyeji)', description:'Local breed chickens. Vaccinated and healthy.', price:25000, unit:'bird', quantity_available:40, category:'livestock', phone:'0750999888', whatsapp:'256750999888', posted_date:new Date().toISOString().slice(0,10), is_negotiable:true, delivery_available:false, rating:4.6, reviews:15 },
  { id:'d5', seller_name:'AgriService Kyenjojo', seller_village:'Kyenjojo Town', seller_type:'store', title:'Land Ploughing Service', description:'Tractor ploughing service. One acre from UGX 120,000.', price:120000, unit:'acre', quantity_available:999, category:'services', phone:'0782500000', whatsapp:'256782500000', posted_date:new Date().toISOString().slice(0,10), is_negotiable:true, delivery_available:true, rating:4.7, reviews:28 },
  { id:'d6', seller_name:'Mugisha Farm Tools', seller_village:'Mpara', seller_type:'store', title:'Hand Hoes (Jembe)', description:'Strong steel hand hoes, wooden handle.', price:22000, unit:'piece', quantity_available:100, category:'tools', phone:'0750414366', whatsapp:'256750414366', posted_date:new Date().toISOString().slice(0,10), is_negotiable:true, delivery_available:false, rating:4.2, reviews:8 },
]
const CATS = [{ k:'all',l:'All',i:'🛍️' },{ k:'crops',l:'Crops',i:'🌾' },{ k:'livestock',l:'Animals',i:'🐄' },{ k:'seeds',l:'Seeds',i:'🌱' },{ k:'tools',l:'Tools',i:'🔧' },{ k:'services',l:'Services',i:'🚜' }]
const TYPE_COLORS: Record<string,string> = { farmer:'#1a6b3a', trader:'#2563eb', vendor:'#d97706', store:'#7c3aed' }

export default function Marketplace() {
  const { user, profile } = useAuth()
  const [listings, setListings] = useState<Listing[]>(DEMO)
  const [cat, setCat]   = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Listing|null>(null)
  const [showSell, setShowSell] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', price:'', unit:'kg', quantity:'', category:'crops', phone:'', is_negotiable:false, delivery_available:false })
  const [posting, setPosting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)
  const fmt = (n:number) => `UGX ${n.toLocaleString()}`

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('marketplace_listings').select('*').eq('is_active', true).order('posted_date', { ascending:false }).limit(50)
      if (data && data.length > 0) setListings([...data, ...DEMO.filter(d => !data.find((r:Listing)=>r.id===d.id))])
    }
    load()
  }, [])

  async function handlePost() {
    if (!profile || !user) return
    setPosting(true)
    await supabase.from('marketplace_listings').insert({
      seller_id: user.id, seller_name: profile.full_name, seller_village: profile.village || 'Kyenjojo',
      seller_type: 'farmer', title: form.title, description: form.description,
      price: parseFloat(form.price), unit: form.unit, quantity_available: parseInt(form.quantity) || 0,
      category: form.category, phone: profile.phone_number || form.phone,
      whatsapp: (profile.phone_number || form.phone)?.replace(/^0/,'256'),
      posted_date: new Date().toISOString().slice(0,10), is_negotiable: form.is_negotiable,
      delivery_available: form.delivery_available, is_active: true,
    })
    setPosting(false); setPostSuccess(true); setShowSell(false)
    setTimeout(() => setPostSuccess(false), 4000)
  }

  const filtered = listings.filter(l => (cat==='all' || l.category===cat) && (search==='' || l.title.toLowerCase().includes(search.toLowerCase()) || l.seller_village.toLowerCase().includes(search.toLowerCase())))

  if (selected) return (
    <div style={{ padding:16 }}>
      <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:16, cursor:'pointer', color:'#374151', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>← Back</button>
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <p style={{ margin:0, fontWeight:800, fontSize:20 }}>{fmt(selected.price)}<span style={{ fontSize:14, fontWeight:500, color:'#6b7280' }}>/{selected.unit}</span></p>
            {selected.is_negotiable && <span className="badge badge-green" style={{ marginTop:4 }}>Negotiable</span>}
          </div>
          <span style={{ background: TYPE_COLORS[selected.seller_type]+'22', color: TYPE_COLORS[selected.seller_type], borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700, textTransform:'capitalize' }}>{selected.seller_type}</span>
        </div>
        <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:800 }}>{selected.title}</h2>
        <p style={{ color:'#6b7280', lineHeight:1.6 }}>{selected.description}</p>
        <div style={{ borderTop:'1px solid #f3f4f6', paddingTop:12, marginTop:12 }}>
          {[['👤 Seller', selected.seller_name],['📍 Village', selected.seller_village],['📦 Available', `${selected.quantity_available} ${selected.unit}`],['🚚 Delivery', selected.delivery_available ? 'Available' : 'No delivery'],['📅 Posted', selected.posted_date]].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f9fafb' }}>
              <span style={{ color:'#6b7280', fontSize:14 }}>{l}</span><span style={{ fontWeight:600, fontSize:14 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <a href={`tel:${selected.phone}`} style={{ display:'block', background:'#1a6b3a', color:'white', textAlign:'center', padding:'16px', borderRadius:16, fontWeight:700, fontSize:18, textDecoration:'none', marginBottom:12 }}>📞 Call Seller</a>
      <a href={`https://wa.me/${selected.whatsapp}?text=Hi, I'm interested in your listing: ${selected.title}`} target="_blank" rel="noopener noreferrer"
        style={{ display:'block', background:'#25d366', color:'white', textAlign:'center', padding:'16px', borderRadius:16, fontWeight:700, fontSize:18, textDecoration:'none' }}>💬 WhatsApp</a>
    </div>
  )

  return (
    <div style={{ padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div><h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>🏪 Marketplace</h2><p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{filtered.length} listings • Kyenjojo Area</p></div>
        <button onClick={() => setShowSell(true)} style={{ background:'#d4a017', color:'white', border:'none', borderRadius:12, padding:'10px 16px', fontWeight:700, fontSize:14, cursor:'pointer' }}>+ Sell</button>
      </div>
      {postSuccess && <div style={{ background:'#dcfce7', color:'#16a34a', borderRadius:12, padding:12, marginBottom:12, fontWeight:600 }}>✅ Listing posted!</div>}
      {/* Search */}
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings, village..."
        style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'12px 16px', fontSize:16, outline:'none', marginBottom:12, background:'white' }} />
      {/* Category filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:16 }}>
        {CATS.map(c => (
          <button key={c.k} onClick={() => setCat(c.k)}
            style={{ background: cat===c.k ? '#1a6b3a' : 'white', color: cat===c.k ? 'white' : '#374151', border:`2px solid ${cat===c.k ? '#1a6b3a' : '#e5e7eb'}`, borderRadius:999, padding:'6px 14px', fontWeight:600, fontSize:14, whiteSpace:'nowrap', cursor:'pointer' }}>
            {c.i} {c.l}
          </button>
        ))}
      </div>
      {/* Listings grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {filtered.map(l => (
          <div key={l.id} className="card" onClick={() => setSelected(l)} style={{ cursor:'pointer', padding:12 }}>
            <div style={{ height:60, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, background:'#f5f7f2', borderRadius:10, marginBottom:8 }}>
              {l.category==='crops'?'🌾':l.category==='livestock'?'🐄':l.category==='seeds'?'🌱':l.category==='tools'?'🔧':l.category==='services'?'🚜':'📦'}
            </div>
            <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:13, lineHeight:1.3 }}>{l.title}</p>
            <p style={{ margin:0, color:'#1a6b3a', fontWeight:800, fontSize:14 }}>UGX {l.price.toLocaleString()}/{l.unit}</p>
            <p style={{ margin:'4px 0 0', color:'#9ca3af', fontSize:11 }}>📍 {l.seller_village}</p>
            {l.delivery_available && <span style={{ background:'#dcfce7', color:'#16a34a', borderRadius:999, padding:'2px 8px', fontSize:11, fontWeight:600, display:'inline-block', marginTop:4 }}>🚚 Delivery</span>}
          </div>
        ))}
      </div>

      {/* Post Listing Modal */}
      {showSell && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'white', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:20, fontWeight:800 }}>📦 Post a Listing</h3>
            {[{key:'title',label:'Product/Service Title',type:'text'},{key:'price',label:'Price (UGX)',type:'number'},{key:'unit',label:'Unit (e.g. kg, piece, acre)',type:'text'},{key:'quantity',label:'Quantity Available',type:'number'},{key:'phone',label:'Contact Phone',type:'tel'}].map(f=>(
              <div key={f.key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>{f.label}</label>
                <input type={f.type} value={(form as Record<string,string>)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'12px 14px', fontSize:16, outline:'none' }} />
              </div>
            ))}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Description</label>
              <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'12px 14px', fontSize:16, outline:'none', resize:'none' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Category</label>
              <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{ width:'100%', border:'2px solid #e5e7eb', borderRadius:12, padding:'12px 14px', fontSize:16, outline:'none' }}>
                {['crops','livestock','seeds','tools','services','produce'].map(c=><option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:16, marginBottom:16 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_negotiable} onChange={e=>setForm(p=>({...p,is_negotiable:e.target.checked}))} />
                <span style={{ fontSize:14 }}>Negotiable</span>
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input type="checkbox" checked={form.delivery_available} onChange={e=>setForm(p=>({...p,delivery_available:e.target.checked}))} />
                <span style={{ fontSize:14 }}>Delivery</span>
              </label>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <button onClick={() => setShowSell(false)} style={{ background:'white', border:'2px solid #e5e7eb', borderRadius:12, padding:'14px', fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={handlePost} disabled={posting} style={{ background:'#1a6b3a', color:'white', border:'none', borderRadius:12, padding:'14px', fontWeight:700, cursor:'pointer', opacity:posting?0.7:1 }}>
                {posting ? 'Posting...' : 'Post Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
