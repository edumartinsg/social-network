import { prisma } from '@/infraestructure/database/lib/prisma'
import { app } from '@/presentation/http/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /users/authenticate', () => {

  beforeEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()

    await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: {
        username: 'johndoe',
        email: 'john@email.com',
        password: 'Password123!',
        age: 25,
      },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should authenticate successfully with correct credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: {
        email: 'john@email.com',
        password: 'Password123!',
      },
    })

    expect(response.statusCode).toBe(200)

    const body = response.json()
    expect(body.token).toBeDefined()
    expect(typeof body.token).toBe('string')
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/)
  })

  it('should fail with the wrong password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: {
        email: 'john@email.com',
        password: 'WrongPassword123!',
      },
    })

    expect(response.statusCode).toBe(401)

    const body = response.json()
    expect(body.message).toBe('Invalid credentials')
  })

  it('should fail with an email that does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/authenticate',
      payload: {
        email: 'nobody@email.com',
        password: 'Password123!',
      },
    })

    expect(response.statusCode).toBe(401)

    const body = response.json()
    expect(body.message).toBe('Invalid credentials')
  })
})
