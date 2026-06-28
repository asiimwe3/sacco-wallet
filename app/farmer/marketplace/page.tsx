'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type AccountType = 'farmer' | 'trader' | 'vendor' | 'store'
type Category = 'all' | 'crops' | 'livestock' | 'tools' | 'produce' | 'services' | 'seeds'

interface Listing {
  id: string
  seller_name: string
  seller_type: AccountType
  seller_village: string
  title: string
  description: string
  price: number
  unit: string
  quantity_available: number
  category: Category
  images: string[]
  phone: string
  whatsapp: string
  posted_date: string
  is_negotiable: boolean
  delivery_available: boolean
  rating: number
  reviews: number
}

// Demo listings representing real market data
const DEMO_LISTINGS: Listing[] = [
  { id:'1', seller_name:'Amanya Katusiime', seller_type:'farmer', seller_village:'Butebo', title:'Fresh Maize (Dry)', description:'Dry maize from our farm, clean and ready for grinding. Good for posho mills.', price:1800, unit:'kg', quantity_available:500, category:'crops', images:['🌽'], phone:'0750123456', whatsapp:'256750123456', posted_date:'2026-06-27', is_negotiable:true, delivery_available:false, rating:4.5, reviews:12 },
  { id:'2', seller_name:'Birungi Joyce', seller_type:'farmer', seller_village:'Kyarusozi', title:'Irish Potatoes', description:'Fresh Irish potatoes, medium size. Harvested this week. Sweet and firm.', price:1200, unit:'kg', quantity_available:300, category:'crops', images:['🥔'], phone:'0782067425', whatsapp:'256782067425', posted_date:'2026-06-26', is_negotiable:true, delivery_available:true, rating:4.8, reviews:20 },
  { id:'3', seller_name:'Kyenjojo Agro Traders', seller_type:'trader', seller_village:'Kyenjojo Town', title:'Hybrid Maize Seeds (H614)', description:'Certified hybrid maize seeds. High yield variety. Treated and ready to plant.', price:45000, unit:'2kg bag', quantity_available:50, category:'seeds', images:['🌱'], phone:'0772002326', whatsapp:'256772002326', posted_date:'2026-06-25', is_negotiable:false, delivery_available:true, rating:4.9, reviews:35 },
  { id:'4', seller_name:'Mugisha Farm Tools', seller_type:'store', seller_village:'Mpara', title:'Hand Hoes (Jembe)', description:'Strong steel hand hoes, wooden handle. Perfect for garden work. Bulk orders welcome.', price:22000, unit:'piece', quantity_available:100, category:'tools', images:['⛏️'], phone:'0750414366', whatsapp:'256750414366', posted_date:'2026-06-24', is_negotiable:true, delivery_available:false, rating:4.2, reviews:8 },
  { id:'5', seller_name:'Kahwa Poultry Farm', seller_type:'farmer', seller_village:'Nyabuharwa', title:'Live Chickens (Kienyeji)', description:'Local breed chickens. Good for meat and eggs. Vaccinated and healthy. Minimum 5 birds.', price:25000, unit:'bird', quantity_available:40, category:'livestock', images:['🐓'], phone:'0750999888', whatsapp:'256750999888', posted_date:'2026-06-23', is_negotiable:true, delivery_available:false, rating:4.6, reviews:15 },
  { id:'6', seller_name:'Tusiime Fresh Produce', seller_type:'vendor', seller_village:'Butunduzi', title:'Matoke (Cooking Banana)', description:'Fresh green matoke bunches. Ready to cook. From our organic banana plantation.', price:8000, unit:'bunch', quantity_available:200, category:'produce', images:['🍌'], phone:'0700123456', whatsapp:'256700123456', posted_date:'2026-06-27', is_negotiable:false, delivery_available:true, rating:4.3, reviews:6 },
  { id:'7', seller_name:'AgriService Kyenjojo', seller_type:'store', seller_village:'Kyenjojo Town', title:'Land Ploughing Service', description:'Tractor ploughing service available. One acre from UGX 120,000. Call to schedule.', price:120000, unit:'acre', quantity_available:999, category:'services', images:['🚜'], phone:'0782500000', whatsapp:'256782500000', posted_date:'2026-06-20', is_negotiable:true, delivery_available:true, rating:4.7, reviews:28 },
  { id:'8', seller_name:'Byamukama Robert', seller_type:'farmer', seller_village:'Butunduzi', title:'Beans (Nambale)', description:'Dry climbing beans, Nambale variety. Excellent quality. Sorted and clean.', price:4500, unit:'kg', quantity_available:150, category:'crops', images:['🫘'], phone:'0750777888', whatsapp:'256750777888', posted_date:'2026-06-26', is_negotiable:true, delivery_available:false, rating:4.1, reviews:4 },
]

const CATEGORIES = [
  { key:'all', label:'All', icon:'🛍️' },
  { key:'crops', label:'Crops', icon:'🌾' },
  { key:'produce', label:'Produce', icon:'🥬' },
  { key:'livestock', label:'Animals', icon:'🐄' },
  { key:'seeds', label:'Seeds', icon:'🌱' },
  { key:'tools', label:'Tools', icon:'🔧' },
  { key:'services', label:'Services', icon:'🚜' },
]

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  farmer: '#1a6b3a',
  trader: '#2563eb',
  vendor: '#d97706',
  store: '#7c3aed',
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  farmer: '👨‍🌾 Farmer',
  trader: '🤝 Trader',
  vendor: '🛒 Vendor',
  store: '🏪 Store',
}

export default function Marketplace() {
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Listing|null>(null)
  const [showSell, setShowSell] = useState(false)

  const filtered = DEMO_LISTINGS.filter(l =>
    (category === 'all' || l.category === category) &&
    (search === '' || l.title.toLowerCase().includes(search.toLowerCase()) ||
     l.description.toLowerCase().includes(search.toLowerCase()) ||
     l.seller_village.toLowerCase().includes(search.toLowerCase()))
  )

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`

  if (selected) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setSelected(null)}
          style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginBottom: 12, padding: 0, minHeight: 0 }}>
          ← Back
        </button>

        {/* Product detail */}
        <div style={{ fontSize: 80, textAlign: 'center', padding: 24, background: 'white', borderRadius: 20, marginBottom: 16 }}>
          {selected.images[0]}
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, flex: 1 }}>{selected.title}</h2>
            {selected.is_negotiable && (
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, marginLeft: 8, whiteSpace: 'nowrap' }}>Negotiable</span>
            )}
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: '#1a6b3a' }}>
            {fmt(selected.price)} <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>/ {selected.unit}</span>
          </p>
          <p style={{ margin: '0 0 12px', color: '#374151', lineHeight: 1.6 }}>{selected.description}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#f0fdf4', color: '#1a6b3a', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
              📦 {selected.quantity_available} {selected.unit}s available
            </span>
            {selected.delivery_available && (
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                🚚 Delivery available
              </span>
            )}
          </div>
        </div>

        {/* Seller info */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 15 }}>Seller Information</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: ACCOUNT_TYPE_COLORS[selected.seller_type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {selected.seller_type === 'farmer' ? '👨‍🌾' : selected.seller_type === 'trader' ? '🤝' : selected.seller_type === 'vendor' ? '🛒' : '🏪'}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{selected.seller_name}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>📍 {selected.seller_village}</p>
              <span style={{ background: ACCOUNT_TYPE_COLORS[selected.seller_type] + '20', color: ACCOUNT_TYPE_COLORS[selected.seller_type], fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {ACCOUNT_TYPE_LABELS[selected.seller_type]}
              </span>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#d97706' }}>⭐ {selected.rating}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{selected.reviews} reviews</p>
            </div>
          </div>
        </div>

        {/* Contact buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <a href={`tel:${selected.phone}`}
            style={{ flex: 1, display: 'block', textAlign: 'center', background: '#1a6b3a', color: 'white', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
            📞 Call Seller
          </a>
          <a href={`https://wa.me/${selected.whatsapp}?text=Hi, I saw your listing for ${encodeURIComponent(selected.title)} on SACCO Wallet Marketplace.`}
            target="_blank" rel="noopener"
            style={{ flex: 1, display: 'block', textAlign: 'center', background: '#25d366', color: 'white', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
            💬 WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d9e56)', padding: '16px 16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🏪 Marketplace</h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Buy & sell in Kyenjojo district</p>
          </div>
          <button onClick={() => setShowSell(true)}
            style={{ background: '#d4a017', color: '#1a1a1a', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            + Sell
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search crops, tools, services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: 'none', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key as Category)}
            style={{ whiteSpace: 'nowrap', background: category === cat.key ? '#1a6b3a' : 'white', color: category === cat.key ? 'white' : '#374151', border: category === cat.key ? 'none' : '1px solid #e5e7eb', borderRadius: 20, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, padding: '0 16px 12px' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{filtered.length} listings found</span>
      </div>

      {/* Listing grid */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(listing => (
          <div key={listing.id} onClick={() => setSelected(listing)}
            style={{ background: 'white', borderRadius: 16, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
              {listing.images[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{listing.title}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>⭐{listing.rating}</span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1a6b3a' }}>
                {listing.price.toLocaleString()} UGX<span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>/{listing.unit}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>📍 {listing.seller_village}</span>
                <span style={{ background: ACCOUNT_TYPE_COLORS[listing.seller_type] + '20', color: ACCOUNT_TYPE_COLORS[listing.seller_type], fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>
                  {listing.seller_type.toUpperCase()}
                </span>
                {listing.delivery_available && <span style={{ fontSize: 10, color: '#2563eb' }}>🚚</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sell Modal */}
      {showSell && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>List Something to Sell</h3>
              <button onClick={() => setShowSell(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', minHeight: 0 }}>✕</button>
            </div>

            <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>Choose your seller account type:</p>

            {([
              { type:'farmer', icon:'👨‍🌾', label:'Farmer', desc:'Sell your harvest, livestock, and farm products' },
              { type:'trader', icon:'🤝', label:'Trader / Middleman', desc:'Buy and resell agricultural goods in bulk' },
              { type:'vendor', icon:'🛒', label:'Vendor', desc:'Sell fresh produce, food items at markets' },
              { type:'store', icon:'🏪', label:'Shop / Store', desc:'Sell tools, inputs, and other goods' },
            ] as const).map(acct => (
              <Link key={acct.type} href={`/farmer/my-store?type=${acct.type}`}
                onClick={() => setShowSell(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid #e5e7eb', borderRadius: 14, marginBottom: 10, textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontSize: 32 }}>{acct.icon}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{acct.label}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{acct.desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 20, color: '#9ca3af' }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
