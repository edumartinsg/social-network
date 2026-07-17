import { describe, it, expect, vi } from 'vitest'
import { Password } from './password'
import { IEncryptor } from '@/domain/shared/interfaces/Encryptor'

describe('Password Value Object', () => {

  it('should create a valid password', () => {
    const result = Password.create('P@ssw0rd1')
    const password = result.value

    expect(result.isSuccess).toBe(true)
    expect(password.value).toBe('P@ssw0rd1')
  })

  it('should fail when password is less than 8 characters', () => {
    const result = Password.create('P@ss1')
    expect(result.isFailure).toBe(true)
    expect(result.error).toBeDefined()
  })

  it('should fail when password does not contain an uppercase letter', () => {
    const result = Password.create('p@ssw0rd1')
    expect(result.isFailure).toBe(true)
    expect(result.error).toBeDefined()
  })

  it('should fail when password does not contain a number', () => {
    const result = Password.create('P@ssword')
    expect(result.isFailure).toBe(true)
    expect(result.error).toBeDefined()
  })

  it('should fail when password does not contain a special character', () => {
    const result = Password.create('Passw0rd1')
    expect(result.isFailure).toBe(true)
    expect(result.error).toBeDefined()
  })

  it('should compare two password objects correctly', () => {
    const p1 = Password.create('P@ssw0rd1')
    const p2 = Password.create('P@ssw0rd1')
    const p3 = Password.create('P@ssw0rd2')
    expect(p1.isSuccess && p2.isSuccess && p3.isSuccess).toBe(true)
    expect(p1.value.equals(p2.value)).toBe(true)
    expect(p1.value.equals(p3.value)).toBe(false)
  })  

  // password.test.ts
it('should hash a password', async () => {
  const mockEncryptor: IEncryptor = {
    hash: vi.fn().mockResolvedValue('hashedPassword'),
    compare: vi.fn().mockResolvedValue(true),
  }

  const password = Password.create('Password123!').value
  const hashed = await password.hash(mockEncryptor)

  expect(mockEncryptor.hash).toHaveBeenCalledWith('Password123!')
  expect(hashed).toBeInstanceOf(Password)
})

})