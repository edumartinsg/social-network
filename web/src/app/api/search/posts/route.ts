import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') ?? ''

  const apiResponse = await apiFetch(`/posts/search?query=${encodeURIComponent(query)}`)

  const data = await apiResponse.json().catch(() => ({ results: [] }))
  return NextResponse.json(data, { status: apiResponse.status })
}
