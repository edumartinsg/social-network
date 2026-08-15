import { describe, it, expect } from 'vitest'
import { BcryptEncryptor } from './bcrypt'

describe('BcryptEncryptor', () => {
  it('should hash and compare correctly', async () => {
    const encryptor = new BcryptEncryptor()
    const hashed = await encryptor.hash('Password123!')

    expect(hashed).not.toBe('Password123!')
    const match = await encryptor.compare('Password123!', hashed)
    expect(match).toBe(true)
  })

  it('should return false for wrong password', async () => {
    const encryptor = new BcryptEncryptor()
    const hashed = await encryptor.hash('Password123!')
    const match = await encryptor.compare('WrongPassword', hashed)
    expect(match).toBe(false)
  })
})
