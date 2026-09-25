import { prisma } from '@/infrastructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('GET /users/search', () => {

  beforeEach(async () => {
    await prisma.follow.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function register(email: string, username: string) {
    await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: { email, username, password: 'Password123!', age: 25 },
    })
  }

  it('should find users by a partial, case-insensitive username match', async () => {
    await register('alice@email.com', 'alice_wonder')
    await register('bob@email.com', 'bobsmith')

    const response = await app.inject({
      method: 'GET',
      url: '/users/search?q=ALICE',
    })

    expect(response.statusCode).toBe(200)
    const { results } = response.json()
    expect(results).toHaveLength(1)
    expect(results[0].username).toBe('alice_wonder')
  })

  it('should not require authentication', async () => {
    await register('alice@email.com', 'alice')

    // no authorization header at all -- same public-data reasoning
    // as /posts/search from Challenge 13
    const response = await app.inject({
      method: 'GET',
      url: '/users/search?q=alice',
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return an empty array when nothing matches', async () => {
    await register('alice@email.com', 'alice')

    const response = await app.inject({
      method: 'GET',
      url: '/users/search?q=nobodyhasthisname',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().results).toEqual([])
  })

  it('should fail with a 400 when the query param is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/search',
    })

    expect(response.statusCode).toBe(400)
  })

  it('should never expose password or email in the results', async () => {
    // the use case's own return shape only has username/avatarUrl, but this
    // test pins that down at the HTTP boundary specifically, since that's
    // the layer an accidental full-User serialisation would actually leak from
    await register('alice@email.com', 'alice')

    const response = await app.inject({
      method: 'GET',
      url: '/users/search?q=alice',
    })

    const [result] = response.json().results
    expect(result).not.toHaveProperty('email')
    expect(result).not.toHaveProperty('password')
  })
})
