import { NextResponse } from 'next/server'

// NASA POWER API for Kyenjojo area (approx lat: 0.6, lon: 30.6)
const LAT = 0.6
const LON = 30.6

export async function GET() {
  try {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)

    const fmt = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,'')
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG&longitude=${LON}&latitude=${LAT}&start=${fmt(start)}&end=${fmt(end)}&format=JSON`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const maxTemps = data.properties?.parameter?.T2M_MAX || {}
    const minTemps = data.properties?.parameter?.T2M_MIN || {}
    const rainfall = data.properties?.parameter?.PRECTOTCORR || {}

    const days = Object.keys(maxTemps).slice(-7).map(date => {
      const rain = rainfall[date] || 0
      const tempMax = maxTemps[date] || 25
      const tempMin = minTemps[date] || 18

      let advice = ''
      if (rain > 10) advice = 'Good rain expected. Ideal for planting beans, maize, and groundnuts.'
      else if (rain > 4) advice = 'Light rain coming. Good for weeding and fertilizer application.'
      else if (tempMax > 30) advice = 'Hot and dry. Water crops and avoid planting. Good for harvesting.'
      else advice = 'Mild conditions. Good for general farm work and soil preparation.'

      return {
        date: `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
        temp_max: Math.round(tempMax * 10) / 10,
        temp_min: Math.round(tempMin * 10) / 10,
        rainfall_mm: Math.round(rain * 10) / 10,
        advice
      }
    })

    // Crop planting calendar for Kyenjojo
    const month = new Date().getMonth() + 1
    const plantingAdvice = month >= 3 && month <= 5
      ? 'Long rains season — plant maize, beans, groundnuts now!'
      : month >= 9 && month <= 11
      ? 'Short rains season — good for second planting of maize and beans.'
      : month >= 6 && month <= 8
      ? 'Dry season — focus on irrigation crops like tomatoes and onions.'
      : 'Dry season — harvest, store, and prepare land for next rains.'

    return NextResponse.json({ days, plantingAdvice, location: 'Kyenjojo, Uganda' })
  } catch (e) {
    // Fallback data if API unavailable
    return NextResponse.json({
      days: [
        { date: new Date().toISOString().slice(0,10), temp_max: 26, temp_min: 18, rainfall_mm: 3.2, advice: 'Mild conditions. Good for farm work.' }
      ],
      plantingAdvice: 'Check back when internet is available for full forecast.',
      location: 'Kyenjojo, Uganda',
      offline: true
    })
  }
}
