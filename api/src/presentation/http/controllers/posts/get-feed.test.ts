// src/presentation/http/controllers/posts/get-feed.test.ts
import { env } from '@/env'
import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { registerAndAuthenticate } from '@/test/helpers/register-and-authenticate'
import Redis from 'ioredis'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

const redis = new Redis(env.REDIS_URL)

describe('GET /posts/feed', () => {

  beforeEach(async () => {
    await prisma.follow.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    await redis.flushdb()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await redis.quit()
  })

  async function createPost(token: string, title: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title,
        mediaType: 'image',
        imageUrls: ['https://example.com/photo.jpg'],
      },
    })
    console.log('CREATE POST STATUS:', response.statusCode, response.json())
    return response.json().id as string
  }

  it('should return exactly 5 posts for an anonymous request', async () => {
    const { token } = await registerAndAuthenticate(app, 'alice@email.com', 'alice')

    for (let i = 0; i < 6; i++) {
      await createPost(token, `Post ${i}`)
    }

    const response = await app.inject({ method: 'GET', url: '/posts/feed' })

    expect(response.statusCode).toBe(200)
    expect(response.json().posts).toHaveLength(5)
  })

  it('should fall back to discovery for a new user with no follows', async () => {
    const alice = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    const bob = await registerAndAuthenticate(app, 'bob@email.com', 'bob')
    await createPost(bob.token, 'Bob post')

    const response = await app.inject({
      method: 'GET',
      url: '/posts/feed',
      headers: { authorization: `Bearer ${alice.token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().posts.length).toBeGreaterThan(0)
  })

  it('should show followed users posts for an authenticated user', async () => {
  const alice = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
  const bob = await registerAndAuthenticate(app, 'bob@email.com', 'bob')
  await createPost(bob.token, 'Bob post')

  await app.inject({
    method: 'POST',
    url: `/users/${bob.userId}/follow`,
    headers: { authorization: `Bearer ${alice.token}` },
  })

  const response = await app.inject({
    method: 'GET',
    url: '/posts/feed',
    headers: { authorization: `Bearer ${alice.token}` },
  })

  const posts = response.json().posts
  expect(posts.some((p: any) => p.authorUsername === 'bob')).toBe(true)
})
})
