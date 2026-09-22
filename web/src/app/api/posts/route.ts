import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const apiResponse = await apiFetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    auth: true,
  })

  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
