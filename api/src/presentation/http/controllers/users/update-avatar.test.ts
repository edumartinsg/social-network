import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import FormData from 'form-data'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /users/avatar', () => {

  beforeEach(async () => {
    await prisma.follow.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function registerAndAuthenticate(email: string, username: string) {
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: { username, email, password: 'Password123!', age: 25 },
    })
    console.log('REGISTER STATUS:', registerResponse.statusCode, registerResponse.json())

    const authResponse = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: { identifier: email, password: 'Password123!' },
    })
    console.log('AUTH STATUS:', authResponse.statusCode, authResponse.json())

    const body = authResponse.json()
    const user = await prisma.user.findUnique({ where: { email } })
    return { token: body.token as string, userId: user!.id }
  }

  it('should update the avatar successfully with a valid image', async () => {
    const { token } = await registerAndAuthenticate('alice@email.com', 'alice')

    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'avatar.png',
      contentType: 'image/png',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/users/avatar',
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form.getBuffer(),
    })

    // TEMPORARY: mostra o erro real por trás do 500
    console.log('AVATAR STATUS:', response.statusCode, response.json())

    expect(response.statusCode).toBe(200)
    expect(response.json().avatarUrl).toBeDefined()
    expect(response.json().avatarUrl).toContain('localhost:9000')
  })

  it('should persist the avatar url so a subsequent read reflects it', async () => {
    const { token } = await registerAndAuthenticate('alice@email.com', 'alice')

    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'avatar.png',
      contentType: 'image/png',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/users/avatar',
      headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
      payload: form.getBuffer(),
    })

    // TEMPORARY
    console.log('AVATAR STATUS:', response.statusCode, response.json())

    const user = await prisma.user.findUnique({ where: { email: 'alice@email.com' } })
    expect(user?.avatarUrl).not.toBeNull()
  })

  it('should fail without authentication', async () => {
    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'avatar.png',
      contentType: 'image/png',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/users/avatar',
      headers: form.getHeaders(),
      payload: form.getBuffer(),
    })

    expect(response.statusCode).toBe(401)
  })

  it('should fail with an unsupported file type', async () => {
    const { token } = await registerAndAuthenticate('alice@email.com', 'alice')

    const form = new FormData()
    form.append('file', Buffer.from('not-an-image'), {
      filename: 'doc.pdf',
      contentType: 'application/pdf',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/users/avatar',
      headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
      payload: form.getBuffer(),
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Unsupported image format')
  })

  it('should not let a user overwrite another user\'s avatar', async () => {
    const { token: aliceToken } = await registerAndAuthenticate('alice@email.com', 'alice')
    await registerAndAuthenticate('bob@email.com', 'bob')

    const form = new FormData()
    form.append('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
      filename: 'avatar.png',
      contentType: 'image/png',
    })

    await app.inject({
      method: 'POST',
      url: '/users/avatar',
      headers: { authorization: `Bearer ${aliceToken}`, ...form.getHeaders() },
      payload: form.getBuffer(),
    })

    const bob = await prisma.user.findUnique({ where: { email: 'bob@email.com' } })
    expect(bob?.avatarUrl).toBeNull()
  })
})
