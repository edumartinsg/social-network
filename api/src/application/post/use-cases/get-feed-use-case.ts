import { FollowRepository } from "@/domain/follow/repositories/follow-repository"
import { Post } from "@/domain/post/entities/post"
import { PostRepository } from "@/domain/post/repositories/post-repository"
import { CacheProvider } from "@/domain/shared/interfaces/cache-provider"
import { PostSerializer } from "@/domain/shared/interfaces/post-serializer"

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
const FEED_CACHE_TTL_SECONDS = 30

export class GetFeedUseCase {
  constructor(
    private postRepository: PostRepository,
    private followRepository: FollowRepository,
    private cacheProvider: CacheProvider,
    private postSerializer: PostSerializer // NEW dependency, added to fix the bug below
  ) {}

  public async execute(request: GetFeedUseCaseRequest): Promise<GetFeedResponse> {
    const cacheKey = this.buildCacheKey(request)
    const cached = await this.cacheProvider.get(cacheKey)

    if (cached) {
      // ============================================================
      // THE BUG WAS HERE. Original code:
      //
      //   return JSON.parse(cached) as GetFeedResponse
      //
      // JSON.parse produces PLAIN OBJECTS, not Post instances. Post's
      // real data lives inside a private `props` field on the base
      // Entity class, and mediaType/title/content are GETTERS defined
      // on Post.prototype, not own properties. JSON.stringify only
      // walks own enumerable properties, so it silently dropped the
      // prototype methods when it first wrote this to Redis, and
      // JSON.parse had no way to know it should reconstruct a Post
      // and re-attach those getters on the way back out.
      //
      // Result: on a cache MISS, computeFeed() below returns real
      // Post objects, so post.mediaType.value works fine -- 200.
      // On a cache HIT (any request within the 30s TTL window),
      // this line returned objects that merely LOOKED like posts,
      // with no .mediaType getter at all -- 500,
      // "Cannot read properties of undefined (reading 'value')" in
      // get-feed.ts's .filter(post => post.mediaType.value === ...).
      //
      // That is exactly why it was intermittent: it depended on
      // whether this particular request landed inside or outside the
      // 30-second cache window, not on which posts existed.
      // ============================================================
      const parsed = JSON.parse(cached) as { posts: unknown[]; nextCursor: string | null }
      return {
        // FIX: rebuild real Post entities via the same mapper the
        // Prisma repository uses, instead of trusting the parsed
        // plain objects to already be usable as Post instances.
        posts: this.postSerializer.deserialize(JSON.stringify(parsed.posts)),
        nextCursor: parsed.nextCursor,
      }
    }

    const result = await this.computeFeed(request)

    // FIX (write side, same root cause): serialize through the mapper
    // too, so what goes INTO the cache is the same well-defined shape
    // (PostDTO[]) the read side above expects, rather than whatever
    // JSON.stringify(post) happens to capture by accident.
    const cachePayload = JSON.stringify({
      posts: JSON.parse(this.postSerializer.serialize(result.posts)),
      nextCursor: result.nextCursor,
    })
    await this.cacheProvider.set(cacheKey, cachePayload, FEED_CACHE_TTL_SECONDS)

    return result
  }

  private buildCacheKey(request: GetFeedUseCaseRequest): string {
    if (!request.isAuthenticated || !request.userId) {
      return 'feed:anonymous'
    }
    return `feed:${request.userId}:${request.cursor ?? 'first'}`
  }

  // Everything below this line is UNCHANGED from your original file --
  // the bug was never in the feed-computation logic itself, only in
  // how its result was cached and read back.
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
