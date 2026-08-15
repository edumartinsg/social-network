import { PostRepository } from "@/domain/post/repositories/post-repository"
import { ArticleContent } from "@/domain/post/value-objects/article-content"
import { ImageContent } from "@/domain/post/value-objects/image-content"
import { VideoContent } from "@/domain/post/value-objects/video-content"
import { Image } from "@/domain/shared/image"
import { Result } from "@/domain/shared/result"

interface EditPostUseCaseRequest {
  postId: string
  authorId: string
  body?: string
  imageUrls?: string[]
  videoUrl?: string
  videoDurationSeconds?: number
}

type EditPostUseCaseResponse = Result<void>

export class EditPostUseCase {
  constructor(private postRepository: PostRepository) { }

  public async execute(request: EditPostUseCaseRequest): Promise<EditPostUseCaseResponse> {

    // 1. post must exist
    const post = await this.postRepository.findById(request.postId)
    if (!post) return Result.fail('Post not found')

    // 2. post must not be deleted
    if (post.deletedAt) return Result.fail('Post not found')

    // 3. post must not be under moderation review
    if (post.isDeletedByModeration) return Result.fail('Post not found')

    // 4. caller must be the author
    // deliberately reusing the same message as "not found" above --
    // a caller who is not the author learns nothing about whether the
    // post exists, is deleted, or belongs to someone else. same reasoning
    // as AuthenticateUserUseCase's identical 'Invalid credentials' message:
    // don't let error text become a discovery tool for an attacker probing ids.
    if (post.authorId !== request.authorId) return Result.fail('Post not found')

    // 5. content type cannot change on edit -- always branch on the
    // post's EXISTING mediaType, never on anything the caller supplies
    let contentOrError

    switch (post.mediaType.value) {
      case 'article': {
        const images = (request.imageUrls ?? []).map(url => Image.create(url))
        const failedImage = images.find(r => r.isFailure)
        if (failedImage) return Result.fail(failedImage.error)
        contentOrError = ArticleContent.create(request.body ?? '', images.map(r => r.value))
        break
      }
      case 'image': {
        const images = (request.imageUrls ?? []).map(url => Image.create(url))
        const failedImage = images.find(r => r.isFailure)
        if (failedImage) return Result.fail(failedImage.error)
        contentOrError = ImageContent.create(images.map(r => r.value))
        break
      }
      case 'video': {
        contentOrError = VideoContent.create(
          request.videoUrl ?? '',
          request.videoDurationSeconds ?? 0
        )
        break
      }
      default:
        return Result.fail('Invalid media type')
    }

    if (contentOrError.isFailure) return Result.fail(contentOrError.error)

    // 6. entity applies its own state change
    post.edit(contentOrError.value)

    // 7. persist
    await this.postRepository.save(post)

    return Result.ok(undefined)
  }
}
