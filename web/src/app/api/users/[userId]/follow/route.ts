import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params

  const apiResponse = await apiFetch(`/users/${userId}/follow`, {
    method: 'POST',
    auth: true,
  })

  if (apiResponse.status === 201) {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const data = await apiResponse.json().catch(() => ({ message: 'Follow failed' }))
  return NextResponse.json(data, { status: apiResponse.status })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params

  const apiResponse = await apiFetch(`/users/${userId}/follow`, {
    method: 'DELETE',
    auth: true,
  })

  if (apiResponse.status === 204) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const data = await apiResponse.json().catch(() => ({ message: 'Unfollow failed' }))
  return NextResponse.json(data, { status: apiResponse.status })
}
