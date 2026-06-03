import { describe, it, expect } from 'vitest'
import { UserId } from './userId'

describe('UserId Value Object', () => {
    it('should create a valid UserId', () => {
        const result = UserId.create()
        const userId = result.value
        expect(result.isSuccess).toBe(true)
        expect(userId.value).toBeDefined()
    })


    //it is generating maximum call exceced error, because of the get value method, it is calling itself recursively 
    //how do I fix it
    it('should create a UserId with a provided valid UUID', () => {
        const validUUID = '123e4567-e89b-12d3-a456-426614174000'
        const result = UserId.create(validUUID)
        const userId = result.value
        expect(result.isSuccess).toBe(true)
        expect(userId.value).toBe(validUUID)
    })

    it ('should compare two UserId objects correctly', () => {
        const userId1 = UserId.create('123e4567-e89b-12d3-a456-426614174000').value
        const userId2 = UserId.create('123e4567-e89b-12d3-a456-426614174000').value
        const userId3 = UserId.create('123e4567-e89b-12d3-a456-426614174001').value

        expect(userId1.equals(userId2)).toBe(true)
        expect(userId1.equals(userId3)).toBe(false)
    })
})