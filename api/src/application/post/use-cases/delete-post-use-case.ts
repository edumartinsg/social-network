import { PostRepository } from "@/domain/post/repositories/PostRepository"
import { Result } from "@/domain/shared/result"

// KNOWN GAP: isModerationAction is a plain boolean supplied by the caller.
// Once this use case is wired to HTTP in Challenge 8, nothing today stops
// a regular authenticated user from setting this flag to true and deleting
// anyone's post as if they were a moderator. This is only safe once the
// system has real roles on the User entity and the JWT, checked by the
// controller before this use case is ever invoked. Not solved here --
// flagged so it is not forgotten before this reaches production.
interface DeletePostUseCaseRequest {
  postId: string
  requesterId: string
  isModerationAction: boolean
}

type DeletePostUseCaseResponse = Result<void>

export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) { }

  public async execute(request: DeletePostUseCaseRequest): Promise<DeletePostUseCaseResponse> {

    const post = await this.postRepository.findById(request.postId)
    if (!post) return Result.fail('Post not found')

    if (request.isModerationAction) {
      // moderation path -- soft delete, flagged, sent to QuarantineZone
      post.deleteByModeration()
      await this.postRepository.softDelete(post)
      return Result.ok(undefined)
    }

    // user path -- must be the actual author
    if (post.authorId !== request.requesterId) {
      return Result.fail('Post not found')
    }

    post.deleteByUser()
    await this.postRepository.hardDelete(post.postId)

    return Result.ok(undefined)
  }
}
