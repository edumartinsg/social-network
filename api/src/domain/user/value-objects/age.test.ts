import { describe, it, expect } from 'vitest'
import { Age } from './age'

describe('Age', () => {
  it('should create a valid age', () => {
    const result = Age.create(25)
    expect(result.isSuccess).toBe(true)
    expect(result.value.value).toBe(25)
  })

  it('should fail if age is under 18', () => {
    const result = Age.create(17)
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('User must be at least 18 years old')
  })

  it('should fail if age is negative', () => {
    const result = Age.create(-1)
    expect(result.isFailure).toBe(true)
  })

  it('should fail if age is undefined', () => {
    // @ts-expect-error testing runtime guard
    const result = Age.create(undefined)
    expect(result.isFailure).toBe(true)
  })

  it('should succeed exactly at 18', () => {
    const result = Age.create(18)
    expect(result.isSuccess).toBe(true)
  })
})
