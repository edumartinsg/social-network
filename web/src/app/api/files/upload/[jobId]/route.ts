import { apiFetch } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  const apiResponse = await apiFetch(`/files/upload/${jobId}/status`, {
    auth: true,
  })

  const data = await apiResponse.json()
  return NextResponse.json(data, { status: apiResponse.status })
}
