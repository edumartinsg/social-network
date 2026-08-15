import { prisma } from '@/infraestructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('DELETE /posts/:id', () => {

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

  it('should hard delete a post and remove the row from the database', async () => {
    const token = await registerAndAuthenticate('alice@email.com', 'alice')
    const postId = await createArticlePost(token)

    const response = await app.inject({
      method: 'DELETE',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const row = await prisma.post.findUnique({ where: { id: postId } })
    expect(row).toBeNull()
  })

  it('should fail without a token', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/posts/some-id',
    })

    expect(response.statusCode).toBe(401)
  })

  it('should fail if the post belongs to another user', async () => {
    const aliceToken = await registerAndAuthenticate('alice@email.com', 'alice')
    const postId = await createArticlePost(aliceToken)

    const bobToken = await registerAndAuthenticate('bob@email.com', 'bob')

    const response = await app.inject({
      method: 'DELETE',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${bobToken}` },
    })

    expect(response.statusCode).toBe(404)

    const row = await prisma.post.findUnique({ where: { id: postId } })
    expect(row).not.toBeNull()
  })
})
