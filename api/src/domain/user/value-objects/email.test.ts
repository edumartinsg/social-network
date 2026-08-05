import { describe, it, expect } from 'vitest'
import { Email } from './email'

describe('Email', () => {
  it('should create a valid email', () => {
    const result = Email.create('john@email.com')
    expect(result.isSuccess).toBe(true)
    expect(result.value.value).toBe('john@email.com')
  })

  it('should store the email in lowercase', () => {
    const result = Email.create('John@Email.com')
    expect(result.value.value).toBe('john@email.com')
  })

  it('should fail with an empty email', () => {
    const result = Email.create('')
    expect(result.isFailure).toBe(true)
  })

  it('should fail with an invalid format', () => {
    const result = Email.create('not-an-email')
    expect(result.isFailure).toBe(true)
  })

  it('should trim whitespace', () => {
    const result = Email.create('  john@email.com  ')
    expect(result.value.value).toBe('john@email.com')
  })

  it('should compare two equal emails as equal', () => {
    const a = Email.create('john@email.com').value
    const b = Email.create('john@email.com').value
    expect(a.equals(b)).toBe(true)
  })
})
