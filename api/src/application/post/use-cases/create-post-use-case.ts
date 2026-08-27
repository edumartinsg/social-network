import { Post } from "@/domain/post/entities/post"
import { PostRepository } from "@/domain/post/repositories/post-repository"
import { ArticleContent } from "@/domain/post/value-objects/article-content"
import { ImageContent } from "@/domain/post/value-objects/image-content"
import { MediaType } from "@/domain/post/value-objects/media-type"
import { PostCaption } from "@/domain/post/value-objects/post-caption"
import { PostTitle } from "@/domain/post/value-objects/post-title"
import { VideoContent } from "@/domain/post/value-objects/video-content"
import { Image } from "@/domain/shared/image"
import { EmbeddingQueue } from "@/domain/shared/interfaces/embedding-queue"
import { Result } from "@/domain/shared/result"
import { UserRepository } from "@/domain/user/repositories/user-repository"

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
    private userRepository: UserRepository,
    private embeddingQueue: EmbeddingQueue
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

    // 8. enqueue embedding generation -- fire-and-forget from the caller's
    // perspective, matches Challenge 11's reasoning: a network call (this
    // one to Ollama) shouldn't block the HTTP response. Text embedded is
    // title + caption + article body, whichever apply -- searchable across
    // every media type, not just articles, since title/caption exist on all
    const searchableText = [
      titleOrError.value.value,
      caption?.value,
      mediaTypeOrError.value.value === 'article' ? (content as ArticleContent).body : null,
    ].filter(Boolean).join(' ')

    await this.embeddingQueue.enqueue(postOrError.value.postId, searchableText)

    return Result.ok(postOrError.value)
  }

}
