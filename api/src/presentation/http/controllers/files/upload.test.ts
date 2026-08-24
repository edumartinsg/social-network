// src/presentation/http/controllers/files/upload.test.ts
import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { registerAndAuthenticate } from '@/test/helpers/register-and-authenticate'
import FormData from 'form-data'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /files/upload', () => {

  beforeEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })



  it('should enqueue an upload job successfully with authentication', async () => {
const { token } = await registerAndAuthenticate(app, 'alice@email.com', 'alice')

    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'test.png',
      contentType: 'image/png',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/files/upload',
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form.getBuffer(),
    })

    // 202, not 201 -- the file has been accepted for processing,
    // it has not actually been uploaded yet at the moment this response is sent
    expect(response.statusCode).toBe(202)
    expect(response.json().jobId).toBeDefined()
  })

  it('should fail without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/files/upload',
    })

    expect(response.statusCode).toBe(401)
  })
})

// Testing approach: we do NOT run a real worker during these tests.
// We only confirm the controller correctly enqueues a job (202 + jobId)
// and that the status endpoint correctly reads job state from BullMQ.
// We do not wait for a job to reach 'completed', since that would
// require a live worker process running alongside the test suite --
// more realistic, but slower and more complex to set up reliably in CI.
// The worker's own processing logic is proven separately by the
// synchronous UploadFileUseCase tests from Challenge 10, which the
// worker calls internally unchanged.

describe('GET /files/upload/:jobId/status', () => {

  beforeEach(async () => {
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })



  it('should return 404 for a job that does not exist', async () => {
    const { token } = await registerAndAuthenticate(app, 'alice@email.com', 'alice')

    const response = await app.inject({
      method: 'GET',
      url: '/files/upload/nonexistent-job-id/status',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return the job status right after enqueueing, before any worker processes it', async () => {
    const { token } = await registerAndAuthenticate(app, 'alice@email.com', 'alice')

    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'test.png',
      contentType: 'image/png',
    })

    const uploadResponse = await app.inject({
      method: 'POST',
      url: '/files/upload',
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form.getBuffer(),
    })

    expect(uploadResponse.statusCode).toBe(202)
    const { jobId } = uploadResponse.json()
    expect(jobId).toBeDefined()

    const statusResponse = await app.inject({
      method: 'GET',
      url: `/files/upload/${jobId}/status`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(statusResponse.statusCode).toBe(200)
    const body = statusResponse.json()
    expect(body.jobId).toBe(jobId)
    // without a live worker, the job should be 'waiting' or 'active',
    // never 'completed' -- this is the direct proof the queue architecture
    // actually decoupled the HTTP response from the real upload work
    expect(['waiting', 'active']).toContain(body.status)
    expect(body.url).toBeNull()
  })

  it('should fail without authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/files/upload/some-job-id/status',
    })

    expect(response.statusCode).toBe(401)
  })
})
