import { IEncryptor } from '@/domain/shared/interfaces/encryptor'
import { describe, expect, it, vi } from 'vitest'
import { Password } from './password'

describe('Password', () => {
  it('should create a valid password', () => {
    const result = Password.create('Password123!')
    expect(result.isSuccess).toBe(true)
  })

  it('should fail with less than 8 characters', () => {
    const result = Password.create('Ab1!')
    expect(result.isFailure).toBe(true)
  })

  it('should fail without an uppercase letter', () => {
    const result = Password.create('password123!')
    expect(result.isFailure).toBe(true)
  })

  it('should fail without a number', () => {
    const result = Password.create('Password!')
    expect(result.isFailure).toBe(true)
  })

  it('should fail without a special character', () => {
    const result = Password.create('Password123')
    expect(result.isFailure).toBe(true)
  })

  it('should hash the password using the injected encryptor', async () => {
    const mockEncryptor: IEncryptor = {
      hash: vi.fn().mockResolvedValue('hashed_value'),
      compare: vi.fn().mockResolvedValue(true),
    }

    const password = Password.create('Password123!').value
    const hashed = await password.hash(mockEncryptor)

    expect(mockEncryptor.hash).toHaveBeenCalledWith('Password123!')
    expect(hashed).toBeInstanceOf(Password)
    expect(hashed.isHashed()).toBe(true)
  })

  it('should create a hashed password without validating complexity', () => {
    const result = Password.createHashed('$2b$10$somehashvaluehere')
    expect(result.isSuccess).toBe(true)
    expect(result.value.isHashed()).toBe(true)
  })
})
