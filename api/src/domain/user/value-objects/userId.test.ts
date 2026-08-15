import { describe, it, expect } from 'vitest'
import { UserId } from './userId'

describe('UserId', () => {
  it('should generate a valid UUID when none is provided', () => {
    const result = UserId.create()
    expect(result.isSuccess).toBe(true)
  })

  it('should accept a valid UUID', () => {
    const result = UserId.create('550e8400-e29b-41d4-a716-446655440000')
    expect(result.isSuccess).toBe(true)
  })

  it('should fail with an invalid UUID', () => {
    const result = UserId.create('not-a-uuid')
    expect(result.isFailure).toBe(true)
  })
})
