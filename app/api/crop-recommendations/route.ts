import { NextResponse } from 'next/server'

const LAT = 0.6
const LON = 30.6

// Kyenjojo crop database with climate requirements
const CROPS = [
  {
    name: 'Maize (Posho)', emoji: '🌽', local: 'Kasooli',
    temp_min: 18, temp_max: 32, rainfall_min: 4, rainfall_max: 15,
    seasons: [3,4,5,9,10,11],
    soil: 'Loam, clay-loam',
    days_to_harvest: 90,
    avg_yield_kg_acre: 1200,
    market_price_ugx: 1800,
    tips: ['Apply CAN fertilizer 6 weeks after planting', 'Thin to 1 plant per hole after 2 weeks', 'Watch for stalk borer — treat early'],
  },
  {
    name: 'Beans', emoji: '🫘', local: 'Ebinyeebwa',
    temp_min: 16, temp_max: 28, rainfall_min: 3, rainfall_max: 10,
    seasons: [3,4,5,9,10],
    soil: 'Well-drained loam',
    days_to_harvest: 75,
    avg_yield_kg_acre: 600,
    market_price_ugx: 4500,
    tips: ['Soak seeds overnight before planting', 'Do not apply nitrogen fertilizer', 'Harvest when pods are dry and rattling'],
  },
  {
    name: 'Irish Potatoes', emoji: '🥔', local: 'Matooke ya Bazungu',
    temp_min: 14, temp_max: 24, rainfall_min: 5, rainfall_max: 12,
    seasons: [2,3,4,8,9,10],
    soil: 'Well-drained, fertile loam',
    days_to_harvest: 120,
    avg_yield_kg_acre: 5000,
    market_price_ugx: 1200,
    tips: ['Use certified seed potatoes', 'Earth up when plants reach 20cm', 'Watch for late blight in wet weather'],
  },
  {
    name: 'Groundnuts', emoji: '🥜', local: 'Ebinyeebwa',
    temp_min: 20, temp_max: 30, rainfall_min: 2, rainfall_max: 8,
    seasons: [3,4,5],
    soil: 'Sandy loam, well-drained',
    days_to_harvest: 100,
    avg_yield_kg_acre: 800,
    market_price_ugx: 6000,
    tips: ['Plant on ridges for drainage', 'No need for nitrogen fertilizer', 'Harvest when lower leaves turn yellow'],
  },
  {
    name: 'Cassava', emoji: '🌿', local: 'Mwogo',
    temp_min: 18, temp_max: 35, rainfall_min: 1, rainfall_max: 20,
    seasons: [1,2,3,4,5,6,7,8,9,10,11,12],
    soil: 'Any — very tolerant',
    days_to_harvest: 270,
    avg_yield_kg_acre: 8000,
    market_price_ugx: 500,
    tips: ['Plant cuttings at an angle', 'Excellent drought resistance', 'Watch for cassava mosaic disease — remove infected plants'],
  },
  {
    name: 'Tomatoes', emoji: '🍅', local: 'Nyanya',
    temp_min: 18, temp_max: 30, rainfall_min: 1, rainfall_max: 6,
    seasons: [1,2,6,7,8],
    soil: 'Rich, well-drained loam',
    days_to_harvest: 75,
    avg_yield_kg_acre: 10000,
    market_price_ugx: 2000,
    tips: ['Stake plants when 30cm tall', 'Spray for early blight every 2 weeks', 'Best grown in dry season with irrigation'],
  },
  {
    name: 'Coffee (Robusta)', emoji: '☕', local: 'Kahawa',
    temp_min: 18, temp_max: 28, rainfall_min: 3, rainfall_max: 15,
    seasons: [1,2,3,4,5,6,7,8,9,10,11,12],
    soil: 'Deep, well-drained loam',
    days_to_harvest: 730,
    avg_yield_kg_acre: 300,
    market_price_ugx: 12000,
    tips: ['Harvest only red cherries', 'Prune after main harvest', 'Apply mulch to conserve moisture'],
  },
  {
    name: 'Matoke (Banana)', emoji: '🍌', local: 'Matoke',
    temp_min: 20, temp_max: 35, rainfall_min: 4, rainfall_max: 20,
    seasons: [1,2,3,4,5,6,7,8,9,10,11,12],
    soil: 'Deep, fertile loam',
    days_to_harvest: 365,
    avg_yield_kg_acre: 15000,
    market_price_ugx: 800,
    tips: ['Desuck to 1-2 followers per plant', 'Apply potassium-rich fertilizer', 'Mulch heavily to conserve moisture'],
  },
  {
    name: 'Onions', emoji: '🧅', local: 'Bitunguru',
    temp_min: 15, temp_max: 30, rainfall_min: 0.5, rainfall_max: 5,
    seasons: [6,7,8,12,1],
    soil: 'Sandy loam, well-drained',
    days_to_harvest: 120,
    avg_yield_kg_acre: 4000,
    market_price_ugx: 3500,
    tips: ['Best grown in dry season with irrigation', 'Plant in raised beds', 'Reduce watering 2 weeks before harvest'],
  },
  {
    name: 'Sweet Potatoes', emoji: '🍠', local: 'Lumonde',
    temp_min: 20, temp_max: 32, rainfall_min: 2, rainfall_max: 10,
    seasons: [3,4,5,9,10,11],
    soil: 'Sandy loam',
    days_to_harvest: 120,
    avg_yield_kg_acre: 6000,
    market_price_ugx: 1000,
    tips: ['Plant on ridges', 'Orange-fleshed varieties are most nutritious', 'Resistant to drought once established'],
  },
]

function scoreCrop(crop: typeof CROPS[0], avgTemp: number, avgRain: number, month: number): number {
  let score = 0
  // Temperature match (0-40 pts)
  if (avgTemp >= crop.temp_min && avgTemp <= crop.temp_max) score += 40
  else if (avgTemp >= crop.temp_min - 3 && avgTemp <= crop.temp_max + 3) score += 20
  // Rainfall match (0-40 pts)
  if (avgRain >= crop.rainfall_min && avgRain <= crop.rainfall_max) score += 40
  else if (avgRain >= crop.rainfall_min * 0.5 && avgRain <= crop.rainfall_max * 1.5) score += 20
  // Season match (0-20 pts)
  if (crop.seasons.includes(month)) score += 20
  else if (crop.seasons.includes(month - 1) || crop.seasons.includes(month + 1)) score += 10
  return score
}

export async function GET() {
  try {
    // Fetch real weather from NASA POWER
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 14)
    const fmt = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,'')
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG&longitude=${LON}&latitude=${LAT}&start=${fmt(start)}&end=${fmt(end)}&format=JSON`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const maxTemps = Object.values(data.properties?.parameter?.T2M_MAX || {}) as number[]
    const minTemps = Object.values(data.properties?.parameter?.T2M_MIN || {}) as number[]
    const rainfalls = Object.values(data.properties?.parameter?.PRECTOTCORR || {}) as number[]

    const avgTempMax = maxTemps.length ? maxTemps.reduce((a,b)=>a+b,0)/maxTemps.length : 26
    const avgTempMin = minTemps.length ? minTemps.reduce((a,b)=>a+b,0)/minTemps.length : 18
    const avgTemp = (avgTempMax + avgTempMin) / 2
    const avgRain = rainfalls.length ? rainfalls.reduce((a,b)=>a+b,0)/rainfalls.length : 5
    const totalRain14d = rainfalls.reduce((a,b)=>a+b,0)

    const month = new Date().getMonth() + 1
    const season = month>=3&&month<=5 ? 'Long Rains (Season A)' : month>=9&&month<=11 ? 'Short Rains (Season B)' : month>=6&&month<=8 ? 'Dry Season (June-August)' : 'Dry Season (Dec-Feb)'

    // Score and rank all crops
    const scored = CROPS.map(crop => ({
      ...crop,
      score: scoreCrop(crop, avgTemp, avgRain, month),
      estimated_revenue: crop.avg_yield_kg_acre * crop.market_price_ugx,
    })).sort((a,b) => b.score - a.score)

    const top = scored.slice(0, 5)
    const avoid = scored.filter(c => c.score < 30).slice(0, 3)

    // Generate AI narrative
    const topCrop = top[0]
    const climate_summary = `Average temperature: ${avgTemp.toFixed(1)}°C. Rainfall in last 14 days: ${totalRain14d.toFixed(1)}mm. Currently ${season}.`

    const recommendation_text = `Based on current Kyenjojo weather (${avgTemp.toFixed(1)}°C average, ${totalRain14d.toFixed(0)}mm rain in 14 days), ${topCrop.name} is your best option right now. ${season} conditions favour crops that need ${avgRain > 5 ? 'moderate to good rainfall' : 'dry to moderate conditions'}. Expected income from 1 acre: UGX ${topCrop.estimated_revenue.toLocaleString()}.`

    return NextResponse.json({
      climate: { avgTemp: Math.round(avgTemp*10)/10, avgRain: Math.round(avgRain*10)/10, totalRain14d: Math.round(totalRain14d*10)/10, season },
      climate_summary,
      recommendation_text,
      top_crops: top,
      avoid_crops: avoid,
      location: 'Kyenjojo, Uganda',
    })
  } catch {
    // Fallback with static Kyenjojo data for June/July
    const month = new Date().getMonth() + 1
    const avgTemp = 23, avgRain = 4
    const scored = CROPS.map(crop => ({
      ...crop,
      score: scoreCrop(crop, avgTemp, avgRain, month),
      estimated_revenue: crop.avg_yield_kg_acre * crop.market_price_ugx,
    })).sort((a,b) => b.score - a.score)
    return NextResponse.json({
      climate: { avgTemp, avgRain, totalRain14d: 56, season: 'Dry Season' },
      climate_summary: 'Using estimated Kyenjojo climate data.',
      recommendation_text: 'Based on typical Kyenjojo June conditions, Cassava and Matoke are your safest bets right now.',
      top_crops: scored.slice(0,5),
      avoid_crops: scored.filter(c=>c.score<30).slice(0,3),
      location: 'Kyenjojo, Uganda',
      offline: true,
    })
  }
}
