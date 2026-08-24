import { NextRequest, NextResponse } from 'next/server'

// The one place identifier/password ever touch a cookie. Every other
// authenticated route trusts this cookie already being set -- centralising
// the httpOnly write here is what makes that trust safe (Challenge 15's
// BFF decision: the browser never holds the JWT itself).
export async function POST(request: NextRequest) {
  const body = await request.json()

  const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await apiResponse.json()

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
