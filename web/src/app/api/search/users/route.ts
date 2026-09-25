import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const apiResponse = await apiFetch(`/users/search?q=${encodeURIComponent(q)}`)

  const data = await apiResponse.json().catch(() => ({ results: [] }))
  return NextResponse.json(data, { status: apiResponse.status })
}
