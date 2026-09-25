import { FileStorage } from '@/domain/shared/interfaces/file-storage'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'
import { Age } from '@/domain/user/value-objects/age'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserId } from '@/domain/user/value-objects/userId'
import { UserName } from '@/domain/user/value-objects/username'
import { describe, expect, it, vi } from 'vitest'
import { UpdateUserAvatarUseCase } from './update-user-avatar-use-case'

function makeUser(overrides?: { id?: string }) {
  return User.create({
    id: overrides?.id ? UserId.create(overrides.id).value : UserId.create().value,
    email: Email.create('john@email.com').value,
    username: UserName.create('johndoe').value,
    age: Age.create(25).value,
    password: Password.createHashed('$2b$10$hashedpassword').value,
    name: 'John Doe',
  }).value
}

function makeMockUserRepository(overrides?: Partial<UserRepository>): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    searchByUsername: vi.fn().mockResolvedValue([]),
    findManyByIds: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeMockFileStorage(overrides?: Partial<FileStorage>): FileStorage {
  return {
    upload: vi.fn().mockResolvedValue('https://cdn.example.com/avatars/some-key'),
    ...overrides,
  }
}

describe('UpdateUserAvatarUseCase', () => {
  const validFile = Buffer.from('fake-image-bytes')

  it('should update the avatar successfully with a valid image', async () => {
    const user = makeUser({ id: '123e4567-e89b-12d3-a456-426614174000' })
    const userRepository = makeMockUserRepository({
      findById: vi.fn().mockResolvedValue(user),
    })
    const fileStorage = makeMockFileStorage()

    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    const result = await useCase.execute({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      file: validFile,
      mimeType: 'image/png',
    })

    expect(result.isSuccess).toBe(true)
    expect(fileStorage.upload).toHaveBeenCalledTimes(1)
    expect(userRepository.save).toHaveBeenCalledTimes(1)
    expect(result.value.avatarUrl).toBe('https://cdn.example.com/avatars/some-key')
  })

  it('should call fileStorage.upload with the correct fileName/contentType shape', async () => {
    const user = makeUser({ id: '123e4567-e89b-12d3-a456-426614174000' })
    const userRepository = makeMockUserRepository({
      findById: vi.fn().mockResolvedValue(user),
    })
    const fileStorage = makeMockFileStorage()

    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    await useCase.execute({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      file: validFile,
      mimeType: 'image/jpeg',
    })

    // pins down the exact parameter shape FileStorage expects --
    // this is the test that would have caught bug 4 (mimeType/key
    // instead of contentType/fileName) before it reached runtime
    expect(fileStorage.upload).toHaveBeenCalledWith({
      buffer: validFile,
      fileName: expect.stringContaining('123e4567-e89b-12d3-a456-426614174000'),
      contentType: 'image/jpeg',
    })
  })

  it('should fail with an unsupported mime type', async () => {
    const userRepository = makeMockUserRepository()
    const fileStorage = makeMockFileStorage()
    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    const result = await useCase.execute({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      file: validFile,
      mimeType: 'application/pdf',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Unsupported image format')
    expect(fileStorage.upload).not.toHaveBeenCalled()
    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when the file exceeds the 5MB limit', async () => {
    const oversizedFile = Buffer.alloc(5 * 1024 * 1024 + 1)
    const userRepository = makeMockUserRepository()
    const fileStorage = makeMockFileStorage()
    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    const result = await useCase.execute({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      file: oversizedFile,
      mimeType: 'image/png',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Image exceeds the 5MB limit')
    expect(fileStorage.upload).not.toHaveBeenCalled()
  })

  it('should fail if the user does not exist', async () => {
    const userRepository = makeMockUserRepository({
      findById: vi.fn().mockResolvedValue(null),
    })
    const fileStorage = makeMockFileStorage()
    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    const result = await useCase.execute({
      userId: 'nonexistent-id',
      file: validFile,
      mimeType: 'image/png',
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('User not found')
    expect(fileStorage.upload).not.toHaveBeenCalled()
  })

  it('should not save the user if the file upload fails', async () => {
    const user = makeUser({ id: '123e4567-e89b-12d3-a456-426614174000' })
    const userRepository = makeMockUserRepository({
      findById: vi.fn().mockResolvedValue(user),
    })
    const fileStorage = makeMockFileStorage({
      upload: vi.fn().mockRejectedValue(new Error('S3 unreachable')),
    })
    const useCase = new UpdateUserAvatarUseCase(userRepository, fileStorage)

    await expect(
      useCase.execute({ userId: '123e4567-e89b-12d3-a456-426614174000', file: validFile, mimeType: 'image/png' })
    ).rejects.toThrow('S3 unreachable')

    expect(userRepository.save).not.toHaveBeenCalled()
  })
})
