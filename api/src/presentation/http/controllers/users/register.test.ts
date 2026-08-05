import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '@/presentation/http/app'
import { prisma } from '@/infraestructure/database/lib/prisma'

describe('POST /users/register', () => {

  beforeEach(async () => {
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should register successfully with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: {
        username: 'johndoe',
        email: 'john@email.com',
        password: 'Password123!',
        age: 25,
      },
    })

    expect(response.statusCode).toBe(201)

    const userInDb = await prisma.user.findUnique({
      where: { email: 'john@email.com' },
    })
    expect(userInDb).not.toBeNull()
    expect(userInDb?.username).toBe('johndoe')
    expect(userInDb?.password).not.toBe('Password123!')
  })

  it('should fail with a duplicate email', async () => {
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

    const response = await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: {
        username: 'janedoe',
        email: 'john@email.com',
        password: 'Password123!',
        age: 25,
      },
    })

    expect(response.statusCode).toBe(400)

    const body = response.json()
    expect(body.message).toBe('Email already in use')

    const count = await prisma.user.count({ where: { email: 'john@email.com' } })
    expect(count).toBe(1)
  })

  it('should fail with a weak password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/register',
      payload: {
        username: 'johndoe',
        email: 'john@email.com',
        password: 'weak',
        age: 25,
      },
    })

    expect(response.statusCode).toBe(400)

    const userInDb = await prisma.user.findUnique({
      where: { email: 'john@email.com' },
    })
    expect(userInDb).toBeNull()
  })
})
