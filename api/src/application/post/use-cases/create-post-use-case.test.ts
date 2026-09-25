import { PostRepository } from '@/domain/post/repositories/post-repository'
import { EmbeddingQueue } from '@/domain/shared/interfaces/embedding-queue'
import { UserRepository } from '@/domain/user/repositories/user-repository'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatePostUseCase } from './create-post-use-case'

describe('CreatePostUseCase', () => {
  let postUseCase: CreatePostUseCase
  let mockPostRepository: PostRepository
  let mockUserRepository: UserRepository
  let mockEmbeddingQueue: EmbeddingQueue

  const baseRequest = {
    authorId: '11111111-1111-4111-8111-111111111111',
    title: 'My first post',
  }

  beforeEach(() => {
    mockPostRepository = {
      findMany: vi.fn().mockResolvedValue([]),
      findByAuthor: vi.fn().mockResolvedValue(null),
      hardDelete: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    }

    mockUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findByUsername: vi.fn().mockResolvedValue(null),
      findManyByIds: vi.fn().mockResolvedValue([]),
      searchByUsername: vi.fn().mockResolvedValue([]),
      // by default, author exists — override in the "not found" test
      findById: vi.fn().mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111' } as any),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }

    mockEmbeddingQueue = {
      enqueue: vi.fn().mockResolvedValue(undefined),
    }

    postUseCase = new CreatePostUseCase(mockPostRepository, mockUserRepository, mockEmbeddingQueue)
  })

  it('should create an article post successfully', async () => {
    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'article',
      body: 'a'.repeat(100),
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should create an image post successfully', async () => {
    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'image',
      imageUrls: ['https://example.com/photo.jpg'],
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should create a video post successfully', async () => {
    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'video',
      videoUrl: 'https://example.com/video.mp4',
      videoDurationSeconds: 120,
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should fail if author does not exist', async () => {
    mockUserRepository.findById = vi.fn().mockResolvedValue(null)

    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'article',
      body: 'a'.repeat(100),
    })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('Author not found')
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if image count exceeds 10', async () => {
    const elevenImages = Array.from({ length: 11 }, (_, i) => `https://example.com/photo${i}.jpg`)

    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'image',
      imageUrls: elevenImages,
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if video duration exceeds 600 seconds', async () => {
    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'video',
      videoUrl: 'https://example.com/video.mp4',
      videoDurationSeconds: 601,
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should not save if validation fails', async () => {
    const result = await postUseCase.execute({
      ...baseRequest,
      mediaType: 'article',
      body: 'too short',
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should enqueue embedding generation with title, caption and body combined', async () => {
    await postUseCase.execute({
      ...baseRequest,
      caption: 'a great day',
      mediaType: 'article',
      body: 'a'.repeat(100),
    })

    expect(mockEmbeddingQueue.enqueue).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('My first post')
    )
  })

  it('should not enqueue embedding generation if validation fails', async () => {
    await postUseCase.execute({
      ...baseRequest,
      mediaType: 'article',
      body: 'too short',
    })

    expect(mockEmbeddingQueue.enqueue).not.toHaveBeenCalled()
  })
})
