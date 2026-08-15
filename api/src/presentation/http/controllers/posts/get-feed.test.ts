// src/presentation/http/controllers/posts/get-feed.test.ts
import { prisma } from '@/infraestructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('GET /posts/feed', () => {

  beforeEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function registerAndAuthenticate(email: string, username: string) {
    await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: { username, email, password: 'Password123!', age: 25 },
    })
    const authResponse = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: { email, password: 'Password123!' },
    })
    const body = authResponse.json()
    const user = await prisma.user.findUnique({ where: { email } })
    return { token: body.token as string, userId: user!.id }
  }

  async function createPost(token: string, title: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: { title, mediaType: 'article', body: 'a'.repeat(100) },
    })
    return response.json().id as string
  }

  it('should return exactly 5 posts for an anonymous request', async () => {
    const { token } = await registerAndAuthenticate('alice@email.com', 'alice')
    for (let i = 0; i < 8; i++) {
      await createPost(token, `Post ${i}`)
    }

    const response = await app.inject({ method: 'GET', url: '/posts/feed' })

    expect(response.statusCode).toBe(200)
    expect(response.json().posts).toHaveLength(5)
  })

  it('should fall back to discovery for a new user with no follows', async () => {
    const alice = await registerAndAuthenticate('alice@email.com', 'alice')
    const bob = await registerAndAuthenticate('bob@email.com', 'bob')
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
    const alice = await registerAndAuthenticate('alice@email.com', 'alice')
    const bob = await registerAndAuthenticate('bob@email.com', 'bob')
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
    expect(posts.some((p: any) => p.title === 'Bob post')).toBe(true)
  })
})
