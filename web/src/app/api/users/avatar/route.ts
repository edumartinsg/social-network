import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Same BFF shape as every other authenticated write: the browser never
// sees the JWT, this route reads it from the httpOnly cookie and attaches
// it as the Authorization header before proxying to the real API.
export async function POST(request: NextRequest) {
  const token = (await cookies()).get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const formData = await request.formData()

  const apiResponse = await fetch(`${process.env.API_URL}/users/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
