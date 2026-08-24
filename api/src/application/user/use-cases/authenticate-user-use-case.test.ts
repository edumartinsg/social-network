import { IEncryptor } from '@/domain/shared/interfaces/encryptor'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'
import { Age } from '@/domain/user/value-objects/age'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserId } from '@/domain/user/value-objects/userId'
import { UserName } from '@/domain/user/value-objects/username'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthenticateUserUseCase } from './authenticate-user-use-case'

function makeUser() {
  return User.create({
    id: UserId.create().value,
    email: Email.create('john@email.com').value,
    username: UserName.create('johndoe').value,
    age: Age.create(25).value,
    password: Password.createHashed('$2b$10$hashedpassword').value,
    name: 'John Doe',
  }).value
}

function makeMockUserRepository(overrides?: Partial<UserRepository>): UserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    findManyByIds: vi.fn().mockResolvedValue([]),
    searchByUsername: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('AuthenticateUserUseCase', () => {
  let mockEncryptor: IEncryptor

  beforeEach(() => {
    mockEncryptor = {
      hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
      compare: vi.fn().mockResolvedValue(true),
    }
  })

  it('should authenticate successfully with valid credentials', async () => {
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail: vi.fn().mockResolvedValue(makeUser()) }),
      mockEncryptor
    )

    const result = await useCase.execute({
      identifier: 'john@email.com',
      password: 'Password123!',
    })

    expect(result.isSuccess).toBe(true)
    expect(mockEncryptor.compare).toHaveBeenCalledTimes(1)
  })

  it('should fail if user is not found', async () => {
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository(),
      mockEncryptor
    )

    const result = await useCase.execute({
      identifier: 'notfound@email.com',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Invalid credentials')
    expect(mockEncryptor.compare).not.toHaveBeenCalled()
  })

  it('should fail if password does not match', async () => {
    mockEncryptor.compare = vi.fn().mockResolvedValue(false)

    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail: vi.fn().mockResolvedValue(makeUser()) }),
      mockEncryptor
    )

    const result = await useCase.execute({
      identifier: 'john@email.com',
      password: 'WrongPassword123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Invalid credentials')
  })


  it('should return same error whether email or password is wrong', async () => {
    const wrongEmail = await new AuthenticateUserUseCase(
      makeMockUserRepository(),
      mockEncryptor
    ).execute({ identifier: 'wrong@email.com', password: 'Password123!' })

    mockEncryptor.compare = vi.fn().mockResolvedValue(false)

    const wrongPassword = await new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail: vi.fn().mockResolvedValue(makeUser()) }),
      mockEncryptor
    ).execute({ identifier: 'john@email.com', password: 'Wrong123!' })

    expect(wrongEmail.error).toBe(wrongPassword.error)
    expect(wrongEmail.error).toBe('Invalid credentials')
  })

  // Username login is new: identifier alone decides which repository
  // lookup runs, so these tests exist to pin down the branch, not just
  // the outcome -- a bug that called findByEmail for a username would
  // still fail closed and pass every test above.
  it('should authenticate successfully when identifier is a username', async () => {
    const findByUsername = vi.fn().mockResolvedValue(makeUser())
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository({ findByUsername }),
      mockEncryptor
    )

    const result = await useCase.execute({
      identifier: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isSuccess).toBe(true)
    expect(findByUsername).toHaveBeenCalledWith('johndoe')
  })

  it('should call findByEmail, never findByUsername, when identifier is email-shaped', async () => {
    const findByEmail = vi.fn().mockResolvedValue(makeUser())
    const findByUsername = vi.fn().mockResolvedValue(null)
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail, findByUsername }),
      mockEncryptor
    )

    await useCase.execute({ identifier: 'john@email.com', password: 'Password123!' })

    expect(findByEmail).toHaveBeenCalledWith('john@email.com')
    expect(findByUsername).not.toHaveBeenCalled()
  })

  it('should call findByUsername, never findByEmail, when identifier is not email-shaped', async () => {
    const findByEmail = vi.fn().mockResolvedValue(null)
    const findByUsername = vi.fn().mockResolvedValue(makeUser())
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail, findByUsername }),
      mockEncryptor
    )

    await useCase.execute({ identifier: 'johndoe', password: 'Password123!' })

    expect(findByUsername).toHaveBeenCalledWith('johndoe')
    expect(findByEmail).not.toHaveBeenCalled()
  })

  it('should fail with the generic message when username does not resolve to a user', async () => {
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository(),
      mockEncryptor
    )

    const result = await useCase.execute({
      identifier: 'ghost',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Invalid credentials')
  })
})
