import { getToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const token = await getToken()
  const body = await request.json()

  const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })


  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
