import { NextResponse } from 'next/server'

// Market prices for Kyenjojo area crops — updated regularly
// In production: integrate with UFIA (Uganda Farmers Information App) or local SACCO data
const MARKET_PRICES = [
  { id: '1', crop: 'Maize', crop_runyoro: 'Kasooli', crop_luganda: 'Kasooli', price_per_kg: 850, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '2', crop: 'Beans', crop_runyoro: 'Ibishyimbo', crop_luganda: 'Bbiinji', price_per_kg: 2800, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '3', crop: 'Groundnuts', crop_runyoro: 'Ekinyeebwa', crop_luganda: 'Ebinyeebwa', price_per_kg: 4200, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '4', crop: 'Cassava', crop_runyoro: 'Omwogo', crop_luganda: 'Muwogo', price_per_kg: 450, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '5', crop: 'Sorghum', crop_runyoro: 'Orubingo', crop_luganda: 'Obuggala', price_per_kg: 1100, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '6', crop: 'Sweet Potato', crop_runyoro: 'Kamote', crop_luganda: 'Lumonde', price_per_kg: 600, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '7', crop: 'Tomatoes', crop_runyoro: 'Nyanya', crop_luganda: 'Nyanya', price_per_kg: 1800, market: 'Fort Portal', updated_at: new Date().toISOString() },
  { id: '8', crop: 'Coffee (Robusta)', crop_runyoro: 'Kahawa', crop_luganda: 'Kawuuwo', price_per_kg: 5500, market: 'Fort Portal', updated_at: new Date().toISOString() },
  { id: '9', crop: 'Banana (Matooke)', crop_runyoro: 'Ebitoke', crop_luganda: 'Matoke', price_per_kg: 700, market: 'Kyenjojo Town', updated_at: new Date().toISOString() },
  { id: '10', crop: 'Sunflower', crop_runyoro: 'Alizeti', crop_luganda: 'Alizeti', price_per_kg: 1600, market: 'Kamwenge', updated_at: new Date().toISOString() },
]

export async function GET() {
  return NextResponse.json({ prices: MARKET_PRICES })
}
