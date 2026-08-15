import { FollowRepository } from "@/domain/follow/repositories/follow-repository"
import { Post } from "@/domain/post/entities/post"
import { PostRepository } from "@/domain/post/repositories/post-repository"
import { CacheProvider } from "@/domain/shared/interfaces/cache-provider"

interface GetFeedUseCaseRequest {
  userId?: string
  cursor?: string
  isAuthenticated: boolean
}

interface GetFeedResponse {
  posts: Post[]
  nextCursor: string | null
}

const ANONYMOUS_LIMIT = 5
const FOLLOWING_LIMIT = 18
const DISCOVERY_LIMIT = 2

// TTL chosen at 30 seconds: short enough that a new post from someone
// you follow appears within a very tolerable delay, long enough that
// a user refreshing their feed repeatedly (a common real behaviour)
// hits the cache almost every time instead of Postgres. This is a
// judgment call, not a fixed rule -- 30s trades a small amount of
// staleness for a meaningful reduction in database load.
const FEED_CACHE_TTL_SECONDS = 30

export class GetFeedUseCase {
  constructor(
    private postRepository: PostRepository,
    private followRepository: FollowRepository,
    private cacheProvider: CacheProvider
  ) {}

  public async execute(request: GetFeedUseCaseRequest): Promise<GetFeedResponse> {
    const cacheKey = this.buildCacheKey(request)

    const cached = await this.cacheProvider.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as GetFeedResponse
    }

    const result = await this.computeFeed(request)

    await this.cacheProvider.set(cacheKey, JSON.stringify(result), FEED_CACHE_TTL_SECONDS)

    return result
  }

  private buildCacheKey(request: GetFeedUseCaseRequest): string {
    if (!request.isAuthenticated || !request.userId) {
      return 'feed:anonymous'
    }
    return `feed:${request.userId}:${request.cursor ?? 'first'}`
  }

  // this is your existing Challenge 9 logic, unchanged -- only extracted
  // into its own method so the cache-aside wrapper above stays readable
  private async computeFeed(request: GetFeedUseCaseRequest): Promise<GetFeedResponse> {
    if (!request.isAuthenticated || !request.userId) {
      const posts = await this.postRepository.findMany({ limit: ANONYMOUS_LIMIT })
      return { posts, nextCursor: null }
    }

    const followingIds = await this.followRepository.findFollowingIds(request.userId)

    if (followingIds.length === 0) {
      const posts = await this.postRepository.findMany({
        authorIdNotIn: [request.userId],
        cursor: request.cursor,
        limit: FOLLOWING_LIMIT + DISCOVERY_LIMIT,
      })
      return this.buildPaginatedResponse(posts, FOLLOWING_LIMIT + DISCOVERY_LIMIT)
    }

    const followingPosts = await this.postRepository.findMany({
      authorIdIn: followingIds,
      cursor: request.cursor,
      limit: FOLLOWING_LIMIT + 1,
    })

    const discoveryPosts = await this.postRepository.findMany({
      authorIdNotIn: [...followingIds, request.userId],
      limit: DISCOVERY_LIMIT,
    })

    const interleaved = this.interleave(followingPosts, discoveryPosts)

    return this.buildPaginatedResponse(interleaved, FOLLOWING_LIMIT + 1)
  }

  private interleave(main: Post[], discovery: Post[]): Post[] {
    const result: Post[] = []
    let discoveryIndex = 0

    main.forEach((post, index) => {
      result.push(post)
      if ((index + 1) % 9 === 0 && discoveryIndex < discovery.length) {
        const discoveryPost = discovery[discoveryIndex]
        if (discoveryPost) {
          result.push(discoveryPost)
          discoveryIndex++
        }
      }
    })

    return result
  }

  private buildPaginatedResponse(posts: Post[], expectedFullPage: number): GetFeedResponse {
    const hasNextPage = posts.length > expectedFullPage - 1
    const trimmed = hasNextPage ? posts.slice(0, expectedFullPage - 1) : posts
    const nextCursor = hasNextPage ? trimmed[trimmed.length - 1]?.postId ?? null : null

    return { posts: trimmed, nextCursor }
  }
}
