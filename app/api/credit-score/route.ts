import { NextRequest, NextResponse } from 'next/server'
import { calculateCreditScore } from '@/lib/credit-score'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = calculateCreditScore(body)
  return NextResponse.json(result)
}
