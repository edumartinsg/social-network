import { prisma } from '@/infraestructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /posts', () => {

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
      payload: {
        username,
        email,
        password: 'Password123!',
        age: 25,
      },
    })

    const authResponse = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: { email, password: 'Password123!' },
    })

    const { token } = authResponse.json()
    return token as string
  }

  it('should fail with no Authorization header', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      payload: {
        title: 'My first post',
        mediaType: 'article',
        body: 'a'.repeat(100),
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should succeed with a valid token', async () => {
    const token = await registerAndAuthenticate('alice@email.com', 'alice')

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        title: 'My first post',
        mediaType: 'article',
        body: 'a'.repeat(100),
      },
    })

    expect(response.statusCode).toBe(201)

    const posts = await prisma.post.findMany()
    if (!posts) throw new Error('No posts found')
    expect(posts).toHaveLength(1)
    if (posts[0])
      expect(posts[0].title).toBe('My first post')
  })

  it('should ignore a forged authorId in the body and use the token instead', async () => {
    const aliceToken = await registerAndAuthenticate('alice@email.com', 'alice')

    await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: {
        username: 'bob',
        email: 'bob@email.com',
        password: 'Password123!',
        age: 25,
      },
    })
    const bob = await prisma.user.findUnique({ where: { email: 'bob@email.com' } })

    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: {
        authorization: `Bearer ${aliceToken}`,
      },
      payload: {
        title: 'Not mine',
        mediaType: 'article',
        body: 'a'.repeat(100),
        authorId: bob?.id,
      },
    })

    expect(response.statusCode).toBe(201)

    const post = await prisma.post.findFirst({ where: { title: 'Not mine' } })
    const alice = await prisma.user.findUnique({ where: { email: 'alice@email.com' } })

    expect(post?.authorId).toBe(alice?.id)
    expect(post?.authorId).not.toBe(bob?.id)
  })
})
