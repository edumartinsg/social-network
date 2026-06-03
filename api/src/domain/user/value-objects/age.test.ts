
import { Age } from './age'
import { describe, it, expect } from 'vitest'

describe('Age Value Object', () => {
  it('should create a valid age', () => {
    const result = Age.create(25)
    const age = result.value
    expect(result.isSuccess).toBe(true)
    expect(age.value).toBe(25)
  })
  it('should fail when age is negative', () => {
    const result = Age.create(-5)
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Age must be a positive number')
  })

  it('should fail when age is less than 18', () => {
    const result = Age.create(17)
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('User must be at least 18 years old')
  })
  it('should fail when age is undefined', () => {
    const result = Age.create(undefined as unknown as number)
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Age is required')
  })

  it('should fail when age is null', () => {
    const result = Age.create(null as unknown as number)
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Age is required')
  })  
})
