import { describe, it, expect } from 'vitest'
import { Email } from './email'

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const result = Email.create('john@example.com')
    const email = result.value

    expect(result.isSuccess).toBe(true)
    expect(email.value).toBe('john@example.com')
  })

  it('should fail when email has no @', () => {
    const result = Email.create('johnexample.com')

    expect(result.isFailure).toBe(true)
    expect(result.error).toBeDefined()
  })

  it('should fail when email is empty', () => {
    const result = Email.create('')

    expect(result.isFailure).toBe(true)
  })

  it('should fail when there is nothing before @', () => {
    const result = Email.create('@example.com')

    expect(result.isFailure).toBe(true)
  })

  it('should fail when there is nothing after @', () => {
    const result = Email.create('john@')

    expect(result.isFailure).toBe(true)
  })

  it('should compare two email objects correctly', () => {
    const e1 = Email.create('john@example.com')
    const e2 = Email.create('john@example.com')
    const e3 = Email.create('jane@example.com')

    expect(e1.isSuccess && e2.isSuccess && e3.isSuccess).toBe(true)

    expect(e1.value.equals(e2.value)).toBe(true)
    expect(e1.value.equals(e3.value)).toBe(false)
  })
})
