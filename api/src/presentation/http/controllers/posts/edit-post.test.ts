import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { registerAndAuthenticate } from '@/test/helpers/register-and-authenticate'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('PUT /posts/:id', () => {

  beforeEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

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
    const {token} = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
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
    const { token: aliceToken } = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    const postId = await createArticlePost(aliceToken)

const { token: bobToken } = await registerAndAuthenticate(app, 'bob@email.com', 'bob')

    const response = await app.inject({
      method: 'PUT',
      url: `/posts/${postId}`,
      headers: { authorization: `Bearer ${bobToken}` },
      payload: { body: 'b'.repeat(100) },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should fail if the post was deleted', async () => {
    const {token} = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
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


    expect(response.statusCode).toBe(404)
  })


})
