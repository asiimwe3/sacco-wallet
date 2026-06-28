'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

type AccountType = 'farmer' | 'trader' | 'vendor' | 'store'

const TYPE_INFO: Record<AccountType, { icon: string; label: string; color: string }> = {
  farmer: { icon: '👨‍🌾', label: 'Farmer', color: '#1a6b3a' },
  trader: { icon: '🤝', label: 'Trader', color: '#2563eb' },
  vendor: { icon: '🛒', label: 'Vendor', color: '#d97706' },
  store:  { icon: '🏪', label: 'Store / Shop', color: '#7c3aed' },
}

function MyStoreContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'farmer') as AccountType
  const info = TYPE_INFO[type] || TYPE_INFO.farmer

  const [step, setStep] = useState<'profile' | 'listing' | 'success'>('profile')
  const [profile, setProfile] = useState({
    business_name: '', phone: '', village: '', district: 'Kyenjojo',
    description: '', delivery: false,
  })
  const [listing, setListing] = useState({
    title: '', category: 'crops', price: '', unit: 'kg',
    quantity: '', description: '', negotiable: false, delivery: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [myListings] = useState([
    { id:'1', title:'Fresh Maize (Dry)', price:1800, unit:'kg', qty:500, status:'active', views:24, inquiries:5 },
    { id:'2', title:'Maize Stalks (Dry feed)', price:500, unit:'bundle', qty:80, status:'active', views:8, inquiries:2 },
  ])

  const handleSubmitListing = async () => {
    if (!listing.title || !listing.price) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setStep('success')
    setSubmitting(false)
  }

  if (step === 'success') {
    return (
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 72 }}>✅</div>
        <h2 style={{ margin: '16px 0 8px', fontSize: 24, fontWeight: 800, color: '#1a6b3a' }}>Listing Posted!</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>Your product is now live on the SACCO Marketplace. Buyers can contact you directly.</p>
        <Link href="/farmer/marketplace"
          style={{ display: 'block', background: '#1a6b3a', color: 'white', padding: 16, borderRadius: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10 }}>
          Browse Marketplace
        </Link>
        <button onClick={() => setStep('listing')}
          style={{ display: 'block', width: '100%', background: '#f3f4f6', color: '#374151', padding: 16, borderRadius: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Post Another Listing
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`, borderRadius: 20, padding: 20, color: 'white', marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{info.icon}</div>
        <h2 style={{ margin: '8px 0 4px', fontWeight: 800, fontSize: 22 }}>{info.label} Store</h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>Sell directly to buyers across Kyenjojo</p>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {(['listing', 'profile'] as const).map(tab => (
          <button key={tab} onClick={() => setStep(tab)}
            style={{ flex: 1, background: step === tab ? 'white' : 'transparent', border: 'none', borderRadius: 10, padding: '10px 4px', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: step === tab ? info.color : '#6b7280' }}>
            {tab === 'listing' ? '📦 Post Listing' : '👤 My Store'}
          </button>
        ))}
      </div>

      {step === 'listing' && (
        <>
          {/* Existing listings */}
          {myListings.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 15 }}>My Active Listings</p>
              {myListings.map(l => (
                <div key={l.id} className="card" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{l.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>UGX {l.price.toLocaleString()}/{l.unit} · {l.qty} available</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>👁 {l.views} views · 💬 {l.inquiries} inquiries</p>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* New listing form */}
          <div className="card">
            <p style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 16 }}>+ Add New Listing</p>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Product / Item Name *</span>
              <input value={listing.title} onChange={e => setListing({...listing, title: e.target.value})}
                placeholder="e.g. Fresh Maize, Irish Potatoes, Hand Hoe..."
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Category</span>
              <select value={listing.category} onChange={e => setListing({...listing, category: e.target.value})}
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                <option value="crops">🌾 Crops / Grains</option>
                <option value="produce">🥬 Fresh Produce</option>
                <option value="livestock">🐄 Livestock / Animals</option>
                <option value="seeds">🌱 Seeds & Inputs</option>
                <option value="tools">🔧 Tools & Equipment</option>
                <option value="services">🚜 Services</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <label style={{ flex: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Price (UGX) *</span>
                <input type="number" value={listing.price} onChange={e => setListing({...listing, price: e.target.value})}
                  placeholder="e.g. 1800"
                  style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </label>
              <label style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Per unit</span>
                <select value={listing.unit} onChange={e => setListing({...listing, unit: e.target.value})}
                  style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                  <option value="kg">kg</option>
                  <option value="bag">bag</option>
                  <option value="bunch">bunch</option>
                  <option value="piece">piece</option>
                  <option value="litre">litre</option>
                  <option value="acre">acre</option>
                  <option value="bird">bird</option>
                  <option value="head">head</option>
                  <option value="tray">tray</option>
                </select>
              </label>
            </div>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Quantity Available</span>
              <input type="number" value={listing.quantity} onChange={e => setListing({...listing, quantity: e.target.value})}
                placeholder="e.g. 500"
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </label>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Description</span>
              <textarea value={listing.description} onChange={e => setListing({...listing, description: e.target.value})}
                placeholder="Describe your product — quality, origin, how to contact, etc."
                rows={3}
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
            </label>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={listing.negotiable} onChange={e => setListing({...listing, negotiable: e.target.checked})} />
                <span style={{ fontSize: 14 }}>Price Negotiable</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={listing.delivery} onChange={e => setListing({...listing, delivery: e.target.checked})} />
                <span style={{ fontSize: 14 }}>Delivery Available</span>
              </label>
            </div>

            <button onClick={handleSubmitListing} disabled={submitting || !listing.title || !listing.price}
              style={{ display: 'block', width: '100%', background: submitting ? '#9ca3af' : info.color, color: 'white', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: 16, border: 'none', cursor: submitting ? 'default' : 'pointer' }}>
              {submitting ? '⏳ Posting...' : '📤 Post Listing'}
            </button>
          </div>
        </>
      )}

      {step === 'profile' && (
        <div className="card">
          <p style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 16 }}>Store Profile</p>
          {[
            { label: 'Business / Store Name', key: 'business_name', placeholder: 'e.g. Amanya Farm Produce' },
            { label: 'Phone Number', key: 'phone', placeholder: '0750 123 456' },
            { label: 'Village / Town', key: 'village', placeholder: 'e.g. Butebo, Kyarusozi' },
          ].map(field => (
            <label key={field.key} style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{field.label}</span>
              <input value={(profile as any)[field.key]}
                onChange={e => setProfile({...profile, [field.key]: e.target.value})}
                placeholder={field.placeholder}
                style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </label>
          ))}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>About Your Store</span>
            <textarea value={profile.description}
              onChange={e => setProfile({...profile, description: e.target.value})}
              placeholder="What do you sell? When are you available?"
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
          </label>
          <button style={{ display: 'block', width: '100%', background: info.color, color: 'white', padding: 16, borderRadius: 14, fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer' }}>
            💾 Save Profile
          </button>
        </div>
      )}
    </div>
  )
}

export default function MyStore() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>}>
      <MyStoreContent />
    </Suspense>
  )
}
