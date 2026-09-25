import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { registerAndAuthenticate } from '@/test/helpers/register-and-authenticate'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('GET /users/:username/posts', () => {

  beforeEach(async () => {
    await prisma.follow.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createImagePost(token: string, title: string) {
    return app.inject({
      method: 'POST',
      url: '/posts',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title,
        mediaType: 'image',
        imageUrls: ['https://example.com/photo.jpg'],
      },
    })
  }

  it('should return the author and their posts', async () => {
    const {token} = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    await createImagePost(token, 'First post')
    await createImagePost(token, 'Second post')

    const response = await app.inject({
      method: 'GET',
      url: '/users/alice/posts',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.author.username).toBe('alice')
    expect(body.posts).toHaveLength(2)
  })

  it('should return posts already shaped as FeedPostView, not raw domain objects', async () => {
    const {token} = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    await createImagePost(token, 'A post')

    const response = await app.inject({
      method: 'GET',
      url: '/users/alice/posts',
    })

    const [post] = response.json().posts
    expect(post).toHaveProperty('mediaUrl')
    expect(post).toHaveProperty('authorUsername', 'alice')
    // proves bug 8's fix: the mapping happened in the controller, so the
    // response is already flat -- not a raw Post with a content union
    expect(post).not.toHaveProperty('content')
  })

  it('should not require authentication', async () => {
    const {token} = await registerAndAuthenticate(app, 'alice@email.com', 'alice')
    await createImagePost(token, 'A post')

    const response = await app.inject({
      method: 'GET',
      url: '/users/alice/posts',
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return 404 for a username that does not exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/nobody/posts',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().message).toBe('User not found')
  })

  it('should return an empty posts array for an author with no posts', async () => {
    await registerAndAuthenticate(app, 'alice@email.com', 'alice')

    const response = await app.inject({
      method: 'GET',
      url: '/users/alice/posts',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().posts).toEqual([])
  })
})
