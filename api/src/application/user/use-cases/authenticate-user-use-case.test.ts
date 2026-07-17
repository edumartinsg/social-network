import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IUserRepository } from '@/domain/user/repositories/UserRepository'
import { IEncryptor } from '@/domain/shared/interfaces/Encryptor'
import { AuthenticateUserUseCase } from './authenticate-user-use-case'
import { User } from '@/domain/user/entities/user'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserName } from '@/domain/user/value-objects/username'
import { Age } from '@/domain/user/value-objects/age'
import { UserId } from '@/domain/user/value-objects/userId'

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

function makeMockUserRepository(overrides?: Partial<IUserRepository>): IUserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
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
      email: 'john@email.com',
      password: 'Password123!',
    })

    expect(result.isSuccess).toBe(true)
    expect(mockEncryptor.compare).toHaveBeenCalledTimes(1)
  })

  it('should fail if user is not found', async () => {
    const useCase = new AuthenticateUserUseCase(
      makeMockUserRepository(), // findByEmail returns null by default
      mockEncryptor
    )

    const result = await useCase.execute({
      email: 'notfound@email.com',
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
      email: 'john@email.com',
      password: 'WrongPassword123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Invalid credentials')
  })

  it('should return same error whether email or password is wrong', async () => {
    const wrongEmail = await new AuthenticateUserUseCase(
      makeMockUserRepository(),
      mockEncryptor
    ).execute({ email: 'wrong@email.com', password: 'Password123!' })

    mockEncryptor.compare = vi.fn().mockResolvedValue(false)

    const wrongPassword = await new AuthenticateUserUseCase(
      makeMockUserRepository({ findByEmail: vi.fn().mockResolvedValue(makeUser()) }),
      mockEncryptor
    ).execute({ email: 'john@email.com', password: 'Wrong123!' })

    expect(wrongEmail.error).toBe(wrongPassword.error)
    expect(wrongEmail.error).toBe('Invalid credentials')
  })
})