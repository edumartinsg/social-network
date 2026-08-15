// application/post/use-cases/get-feed-use-case.test.ts
import { FollowRepository } from '@/domain/follow/repositories/follow-repository'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { CacheProvider } from '@/domain/shared/interfaces/cache-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetFeedUseCase } from './get-feed-use-case'

describe('GetFeedUseCase — caching behaviour', () => {
  let mockPostRepository: PostRepository
  let mockFollowRepository: FollowRepository
  let mockCacheProvider: CacheProvider
  let useCase: GetFeedUseCase

  beforeEach(() => {
    mockPostRepository = {
      findById: vi.fn(),
      findByAuthor: vi.fn(),
      save: vi.fn(),
      hardDelete: vi.fn(),
      softDelete: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    }

    mockFollowRepository = {
      exists: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFollowingIds: vi.fn().mockResolvedValue([]),
    }

    mockCacheProvider = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }

    useCase = new GetFeedUseCase(mockPostRepository, mockFollowRepository, mockCacheProvider)
  })

  it('should hit the repository on a cache miss and then store the result', async () => {
    await useCase.execute({ isAuthenticated: false })

    expect(mockCacheProvider.get).toHaveBeenCalledTimes(1)
    expect(mockPostRepository.findMany).toHaveBeenCalledTimes(1)
    expect(mockCacheProvider.set).toHaveBeenCalledTimes(1)
  })

  it('should return cached data on a hit, without touching the repository', async () => {
    const cachedResponse = JSON.stringify({ posts: [], nextCursor: null })
    mockCacheProvider.get = vi.fn().mockResolvedValue(cachedResponse)

    const result = await useCase.execute({ isAuthenticated: false })

    expect(mockPostRepository.findMany).not.toHaveBeenCalled()
    expect(result).toEqual({ posts: [], nextCursor: null })
  })

  it('should use different cache keys for different users', async () => {
    await useCase.execute({ isAuthenticated: true, userId: 'alice-id' })
    await useCase.execute({ isAuthenticated: true, userId: 'bob-id' })

    const calledKeys = (mockCacheProvider.get as any).mock.calls.map((c: any[]) => c[0])
    expect(calledKeys[0]).not.toBe(calledKeys[1])
    expect(calledKeys[0]).toContain('alice-id')
    expect(calledKeys[1]).toContain('bob-id')
  })

  it('should use a shared cache key for anonymous requests', async () => {
    await useCase.execute({ isAuthenticated: false })
    await useCase.execute({ isAuthenticated: false })

    const calledKeys = (mockCacheProvider.get as any).mock.calls.map((c: any[]) => c[0])
    expect(calledKeys[0]).toBe(calledKeys[1])
    expect(calledKeys[0]).toBe('feed:anonymous')
  })
})
