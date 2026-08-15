import { Result } from "@/domain/shared/result"
import { PostRepository } from "@/domain/post/repositories/PostRepository"
import { UserRepository } from "@/domain/user/repositories/UserRepository"
import { Post } from "@/domain/post/entities/post"
import { MediaType } from "@/domain/post/value-objects/media-type"
import { PostTitle } from "@/domain/post/value-objects/post-title"
import { PostCaption } from "@/domain/post/value-objects/post-caption"
import { ArticleContent } from "@/domain/post/value-objects/article-content"
import { ImageContent } from "@/domain/post/value-objects/image-content"
import { VideoContent } from "@/domain/post/value-objects/video-content"
import { Image } from "@/domain/shared/image"

interface CreatePostUseCaseRequest {
  authorId: string
  title: string
  mediaType: string
  caption?: string | null
  // article
  body?: string
  coverImageUrls?: string[]
  // image
  imageUrls?: string[]
  // video
  videoUrl?: string
  videoDurationSeconds?: number
}

type CreatePostUseCaseResponse = Result<Post>

export class CreatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private userRepository: UserRepository
  ) {}

  public async execute(request: CreatePostUseCaseRequest): Promise<CreatePostUseCaseResponse> {

    // 1. validate author exists
    const author = await this.userRepository.findById(request.authorId)
    if (!author) return Result.fail('Author not found')

    // 2. validate title
    const titleOrError = PostTitle.create(request.title)
    if (titleOrError.isFailure) return Result.fail(titleOrError.error)

    // 3. validate mediaType
    const mediaTypeOrError = MediaType.create(request.mediaType)
    if (mediaTypeOrError.isFailure) return Result.fail(mediaTypeOrError.error)

    // 4. validate caption if provided
    let caption = null
    if (request.caption) {
      const captionOrError = PostCaption.create(request.caption)
      if (captionOrError.isFailure) return Result.fail(captionOrError.error)
      caption = captionOrError.value
    }

    // 5. build content based on mediaType
    let content: ArticleContent | ImageContent | VideoContent

    switch (mediaTypeOrError.value.value) {
      case 'article': {
        const coverImages = (request.coverImageUrls ?? []).map(url => Image.create(url))
        const failedImage = coverImages.find(r => r.isFailure)
        if (failedImage) return Result.fail(failedImage.error)
        const images = coverImages.map(r => r.value)
        const contentOrError = ArticleContent.create(request.body ?? '', images)
        if (contentOrError.isFailure) return Result.fail(contentOrError.error)
        content = contentOrError.value
        break
      }
      case 'image': {
        const imageResults = (request.imageUrls ?? []).map(url => Image.create(url))
        const failedImage = imageResults.find(r => r.isFailure)
        if (failedImage) return Result.fail(failedImage.error)
        const images = imageResults.map(r => r.value)
        const contentOrError = ImageContent.create(images)
        if (contentOrError.isFailure) return Result.fail(contentOrError.error)
        content = contentOrError.value
        break
      }
      case 'video': {
        const contentOrError = VideoContent.create(
          request.videoUrl ?? '',
          request.videoDurationSeconds ?? 0
        )
        if (contentOrError.isFailure) return Result.fail(contentOrError.error)
        content = contentOrError.value
        break
      }
      default:
        return Result.fail('Invalid media type')
    }

    // 6. create post entity
    const postOrError = Post.create({
      title: titleOrError.value,
      caption,
      authorId: request.authorId,
      mediaType: mediaTypeOrError.value,
      content,
    })

    if (postOrError.isFailure) return Result.fail(postOrError.error)

    // 7. persist
    await this.postRepository.save(postOrError.value)

    return Result.ok(postOrError.value)
  }
}
