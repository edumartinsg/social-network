// presentation/http/controllers/health/health-check.test.ts
import { app } from '@/presentation/http/app'
import { describe, expect, it } from 'vitest'

describe('GET /health', () => {
  it('should return 200 and status ok when all dependencies are reachable', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.status).toBe('ok')
    expect(body.checks.database).toBe(true)
    expect(body.checks.redis).toBe(true)
  })
})
