import { User } from '@/domain/user/entities/user'
import { Age } from '@/domain/user/value-objects/age'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserId } from '@/domain/user/value-objects/userId'
import { UserName } from '@/domain/user/value-objects/username'
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { prisma } from "./lib/prisma"
import { PrismaUserRepository } from './prisma-user-repository'

function makeUser(overrides?: { email?: string; username?: string }) {
  return User.create({
    id: UserId.create().value,
    email: Email.create(overrides?.email ?? 'john@email.com').value,
    username: UserName.create(overrides?.username ?? 'johndoe').value,
    age: Age.create(25).value,
    password: Password.createHashed('$2b$10$hashedpassword').value,
    name: 'John Doe',
  }).value
}

describe('PrismaUserRepository', () => {

  afterEach(async () => {
await prisma.follow.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should save and retrieve a user by id', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)

    const found = await repo.findById(user.id.value)

    expect(found).not.toBeNull()
    expect(found?.email.value).toBe('john@email.com')
    expect(found?.username.value).toBe('johndoe')
  })

  it('should return null when user not found', async () => {
    const repo = new PrismaUserRepository()

    const found = await repo.findById('non-existent-id')

    expect(found).toBeNull()
  })

  it('should find a user by email', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)

    const found = await repo.findByEmail('john@email.com')

    expect(found).not.toBeNull()
    expect(found?.id.value).toBe(user.id.value)
  })

  it('should find a user by username', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)

    const found = await repo.findByUsername('johndoe')

    expect(found).not.toBeNull()
  })

  it('should update a user on second save', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)

    user.updateEmail(Email.create('updated@email.com').value)
    await repo.save(user)

    const found = await repo.findById(user.id.value)
    expect(found?.email.value).toBe('updated@email.com')
  })

  it('should soft delete a user', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)
    await repo.delete(user.id.value)

    const row = await prisma.user.findUnique({
      where: { id: user.id.value }
    })

    expect(row?.deletedAt).not.toBeNull()
  })
})
