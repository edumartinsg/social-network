// src/presentation/http/controllers/users/follow.test.ts
import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { registerAndAuthenticate } from '@/test/helpers/register-and-authenticate'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('Follow / Unfollow', () => {

  beforeEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })



  it('should follow another user successfully', async () => {
    const alice = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    const bob = await registerAndAuthenticate(app, 'bob@email.com', 'bob')

    const response = await app.inject({
      method: 'POST',
      url: `/users/${bob.userId}/follow`,
      headers: { authorization: `Bearer ${alice.token}` },
    })

    expect(response.statusCode).toBe(201)
  })

  it('should fail to follow the same user twice', async () => {
    const alice = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    const bob = await registerAndAuthenticate(app, 'bob@email.com', 'bob')

    await app.inject({
      method: 'POST',
      url: `/users/${bob.userId}/follow`,
      headers: { authorization: `Bearer ${alice.token}` },
    })

    const response = await app.inject({
      method: 'POST',
      url: `/users/${bob.userId}/follow`,
      headers: { authorization: `Bearer ${alice.token}` },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should unfollow successfully', async () => {
    const alice = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    const bob = await registerAndAuthenticate(app, 'bob@email.com', 'bob')

    await app.inject({
      method: 'POST',
      url: `/users/${bob.userId}/follow`,
      headers: { authorization: `Bearer ${alice.token}` },
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${bob.userId}/follow`,
      headers: { authorization: `Bearer ${alice.token}` },
    })

    expect(response.statusCode).toBe(204)
  })
})
