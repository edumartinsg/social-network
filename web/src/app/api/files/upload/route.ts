import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const apiResponse = await apiFetch('/files/upload', {
    method: 'POST',
    body: formData,
    auth: true,
  })

  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
