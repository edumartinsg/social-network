import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IUserRepository } from '../repositories/IUserRepository'
import { IEncryptor } from '@/domain/shared/interfaces/IEncryptor'
import { CreateUserUseCase } from './create-user-use-case'

describe('CreateUserUseCase', () => {
  let mockUserRepository: IUserRepository
  let mockEncryptor: IEncryptor
  let useCase: CreateUserUseCase

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findByUsername: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }

    mockEncryptor = {
      hash: vi.fn().mockResolvedValue('hashed_Password123!'),
      compare: vi.fn().mockResolvedValue(true),
    }

    useCase = new CreateUserUseCase(mockUserRepository, mockEncryptor)
  })

  it('should create a user successfully', async () => {
    const result = await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isSuccess).toBe(true)
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com')
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('johndoe')
    expect(mockEncryptor.hash).toHaveBeenCalledWith('Password123!')
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should fail if email is already in use', async () => {
    mockUserRepository.findByEmail = vi.fn().mockResolvedValue({ id: 'existing-id' } as any)

    const result = await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Email already in use')
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if username is already in use', async () => {
    mockUserRepository.findByUsername = vi.fn().mockResolvedValue({ id: 'existing-id' } as any)

    const result = await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Username already in use')
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if email format is invalid', async () => {
    const result = await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'invalid-email',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if password is too weak', async () => {
    const result = await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'weak',
    })

    expect(result.isFailure).toBe(true)
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if age is below 18', async () => {
    const result = await useCase.execute({
      name: 'John Doe',
      age: 17,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('User must be at least 18 years old')
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('should hash the password before saving', async () => {
    await useCase.execute({
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(mockEncryptor.hash).toHaveBeenCalledWith('Password123!')
    expect(mockEncryptor.hash).toHaveBeenCalledTimes(1)
  })

  it('should not save if any validation fails', async () => {
    await useCase.execute({
      name: 'John Doe',
      age: 17, // fails age validation
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'Password123!',
    })

    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })
})