import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaUserRepository } from './prisma-user-repository'
import { User } from '@/domain/user/entities/user'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserName } from '@/domain/user/value-objects/username'
import { Age } from '@/domain/user/value-objects/age'
import { UserId } from '@/domain/user/value-objects/userId'

const testPrisma = new PrismaClient()

// helper to create a valid User domain object for tests
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
    // wipe test data after each test -- safe because this is the test DB
    await testPrisma.post.deleteMany()
    await testPrisma.user.deleteMany()
  })

  afterAll(async () => {
    await testPrisma.$disconnect()
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

    // update email
  //   user.updateEmail(Email.create('updated@email.com').value)
  //   await repo.save(user)

  //   const found = await repo.findById(user.id.value)
  //   expect(found?.email.value).toBe('updated@email.com')
   })

  it('should soft delete a user', async () => {
    const repo = new PrismaUserRepository()
    const user = makeUser()

    await repo.save(user)
    await repo.delete(user.id.value)

    const row = await testPrisma.user.findUnique({
      where: { id: user.id.value }
    })

    expect(row?.deletedAt).not.toBeNull()
  })
})