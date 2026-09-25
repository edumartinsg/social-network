// application/post/use-cases/get-feed-use-case.test.ts
import { FollowRepository } from '@/domain/follow/repositories/follow-repository'
import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { CacheProvider } from '@/domain/shared/interfaces/cache-provider'
import { PostSerializer } from '@/domain/shared/interfaces/post-serializer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetFeedUseCase } from './get-feed-use-case'

describe('GetFeedUseCase — caching behaviour', () => {
  let mockPostRepository: PostRepository
  let mockFollowRepository: FollowRepository
  let mockCacheProvider: CacheProvider
  let mockPostSerializer: PostSerializer
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

    // Why this mock does plain JSON round-tripping instead of reconstructing
    // real Post entities via Post.create(): every test in this file only
    // ever deals with an EMPTY posts array. There is no Post instance for
    // this fake to get wrong. What it needs to prove is that
    // GetFeedUseCase calls serialize/deserialize at the right moments
    // (cache write, cache read) -- not that Value Object reconstruction
    // is correct, which is PostCacheSerializer's own concern and belongs
    // in a test file for that class specifically, not here.
    mockPostSerializer = {
      serialize: vi.fn((posts: Post[]) => JSON.stringify(posts)),
      deserialize: vi.fn((json: string) => JSON.parse(json)),
    }

    useCase = new GetFeedUseCase(
      mockPostRepository,
      mockFollowRepository,
      mockCacheProvider,
      mockPostSerializer
    )
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

  it('should deserialize cached posts through the serializer, not raw JSON.parse', async () => {
    // This is the regression test for the actual bug: it proves the use
    // case calls postSerializer.deserialize on a cache hit rather than
    // trusting JSON.parse's plain-object output directly.
    const cachedResponse = JSON.stringify({ posts: [], nextCursor: null })
    mockCacheProvider.get = vi.fn().mockResolvedValue(cachedResponse)

    await useCase.execute({ isAuthenticated: false })

    expect(mockPostSerializer.deserialize).toHaveBeenCalledTimes(1)
  })

  it('should serialize posts through the serializer before caching, not raw JSON.stringify', async () => {
    await useCase.execute({ isAuthenticated: false })

    expect(mockPostSerializer.serialize).toHaveBeenCalledTimes(1)
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
