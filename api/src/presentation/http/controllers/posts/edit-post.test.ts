import { prisma } from '@/infraestructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('PUT /posts/:id', () => {

  beforeEach(async () => {
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

    return authResponse.json().token as string
  }

  async function createArticlePost(token: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: 'Original title',
        mediaType: 'article',
        body: 'a'.repeat(100),
      },
    })
    return response.json().id as string
  }

  it('should edit an article successfully', async () => {
    const token = await registerAndAuthenticate('alice@email.com', 'alice')
    const postId = await createArticlePost(token)

    const response = await app.inject({
      method: 'PUT',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { body: 'b'.repeat(100) },
    })

    expect(response.statusCode).toBe(200)

    const row = await prisma.post.findUnique({ where: { id: postId } })
    const content = row?.content as any
    expect(content.body).toBe('b'.repeat(100))
    expect(row?.updatedAt).not.toBeNull()
  })

  it('should fail without a token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/posts/some-id',
      payload: { body: 'a'.repeat(100) },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should fail if the post belongs to another user', async () => {
    const aliceToken = await registerAndAuthenticate('alice@email.com', 'alice')
    const postId = await createArticlePost(aliceToken)

    const bobToken = await registerAndAuthenticate('bob@email.com', 'bob')

    const response = await app.inject({
      method: 'PUT',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${bobToken}` },
      payload: { body: 'b'.repeat(100) },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should fail if the post was deleted', async () => {
    const token = await registerAndAuthenticate('alice@email.com', 'alice')
    const postId = await createArticlePost(token)

    await app.inject({
      method: 'DELETE',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const response = await app.inject({
      method: 'PUT',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { body: 'b'.repeat(100) },
    })

    console.log(response.json())

    expect(response.statusCode).toBe(404)
  })


})
