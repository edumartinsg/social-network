import { FollowRepository } from "@/application/follow/repositories/FollowRepository"
import { Post } from "@/domain/post/entities/post"
import { PostRepository } from "@/domain/post/repositories/PostRepository"

interface GetFeedUseCaseRequest {
  userId?: string
  cursor?: string
  isAuthenticated: boolean
}

interface GetFeedResponse {
  posts: Post[]
  nextCursor: string | null
}

//POSTS FOR WHO HAS AN ACCOUNT BUT DOESN'T FOLLOW ANYONE YET
const ANONYMOUS_LIMIT = 5

//NORMAL
const FOLLOWING_LIMIT = 18

//POSTS FOR WHO HAS NO ACCOUNT
const DISCOVERY_LIMIT = 2

export class GetFeedUseCase {
  constructor(
    private postRepository: PostRepository,
    private followRepository: FollowRepository
  ) {}

  public async execute(request: GetFeedUseCaseRequest): Promise<GetFeedResponse> {

    // anonymous: fixed small sample, no personalization, no pagination
    if (!request.isAuthenticated || !request.userId) {
      const posts = await this.postRepository.findMany({ limit: ANONYMOUS_LIMIT })
      return { posts, nextCursor: null }
    }

    const followingIds = await this.followRepository.findFollowingIds(request.userId)

    // new user with no follows yet -- fall back to pure discovery,
    // otherwise the feed would be empty on day one
    if (followingIds.length === 0) {
      const posts = await this.postRepository.findMany({
        authorIdNotIn: [request.userId],
        cursor: request.cursor,
        limit: FOLLOWING_LIMIT + DISCOVERY_LIMIT,
      })
      return this.buildResponse(posts, FOLLOWING_LIMIT + DISCOVERY_LIMIT)
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

    return this.buildResponse(interleaved, FOLLOWING_LIMIT + 1)
  }

  // inserts one discovery post after every 9 following posts
  private interleave(main: Post[], discovery: Post[]): Post[] {
    const result: Post[] = []
    let discoveryIndex = 0

    main.forEach((post, index) => {
      result.push(post)
      // after every 9th post, insert a discovery post if available
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

  private buildResponse(posts: Post[], expectedFullPage: number): GetFeedResponse {
    const hasNextPage = posts.length > expectedFullPage - 1
    const trimmed = hasNextPage ? posts.slice(0, expectedFullPage - 1) : posts
    const nextCursor = hasNextPage ? trimmed[trimmed.length - 1]?.postId ?? null : null

    return { posts: trimmed, nextCursor }
  }
}
