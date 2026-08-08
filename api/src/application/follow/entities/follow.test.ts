import { describe, expect, it } from 'vitest'
import { Follow } from './follow'

describe('Follow', () => {
  it('should create a valid follow relationship', () => {
    const result = Follow.create({ followerId: 'user-1', followingId: 'user-2' })
    expect(result.isSuccess).toBe(true)
    expect(result.value.followerId).toBe('user-1')
    expect(result.value.followingId).toBe('user-2')
  })

  it('should fail when a user tries to follow themselves', () => {
    const result = Follow.create({ followerId: 'user-1', followingId: 'user-1' })
    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('A user cannot follow themselves')
  })
})
