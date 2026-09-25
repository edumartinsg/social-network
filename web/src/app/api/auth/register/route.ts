import { API_URL } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const apiResponse = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
