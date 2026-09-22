import { Post, PostContent } from '@/domain/post/entities/post'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { ImageContent } from '@/domain/post/value-objects/image-content'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { PostCaption } from '@/domain/post/value-objects/post-caption'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { VideoContent } from '@/domain/post/value-objects/video-content'
import { Image } from '@/domain/shared/image'

// Why this module exists separately from PrismaPostRepository: the exact
// same translation -- domain Post to plain JSON and back -- turned out to
// be needed in two places that must never disagree: persisting to Postgres
// and serialising for the Redis cache. Duplicating it would have meant
// exactly the kind of drift this whole session kept finding (two copies of
// one piece of knowledge, silently diverging). Extracting it here means
// there is only one implementation, and both consumers import it.
//
// Why this has no dependency on Prisma or Redis: it operates on plain
// values in, plain values out. That is what makes it reusable by two
// infrastructure concerns that otherwise share nothing.

export interface PostDTO {
  id: string
  title: string
  caption: string | null
  authorId: string
  mediaType: string
  content: unknown
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  isDeletedByModeration: boolean
}

export function postToDTO(post: Post): PostDTO {
  return {
    id: post.postId,
    title: post.title.value,
    caption: post.caption?.value ?? null,
    authorId: post.authorId,
    mediaType: post.mediaType.value,
    content: contentToJson(post.mediaType.value, post.content),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,
    isDeletedByModeration: post.isDeletedByModeration,
  }
}

export function dtoToPost(dto: PostDTO): Post {
  const content = jsonToContent(dto.mediaType, dto.content)

  const caption = dto.caption ? PostCaption.create(dto.caption).value : null

  return Post.create({
    id: dto.id,
    title: PostTitle.create(dto.title).value,
    caption,
    authorId: dto.authorId,
    mediaType: MediaType.create(dto.mediaType).value,
    content,
    createdAt: new Date(dto.createdAt),
  }).value
}

// Why dates round-trip through ISO strings rather than being left as Date
// objects: JSON has no Date type. JSON.stringify silently calls
// .toISOString() on a Date, but JSON.parse never converts a string back --
// it stays a string forever unless something explicitly parses it. Doing
// that conversion explicitly here, in both directions, is what makes this
// safe to round-trip through Redis, where everything is a string.

function contentToJson(mediaType: string, content: PostContent): unknown {
  switch (mediaType) {
    case 'article':
      return {
        body: (content as ArticleContent).body,
        images: (content as ArticleContent).images.map((i: Image) => i.url),
      }
    case 'image':
      return { images: (content as ImageContent).images.map((i: Image) => i.url) }
    case 'video':
      return {
        url: (content as VideoContent).url,
        durationSeconds: (content as VideoContent).durationSeconds,
      }
    default:
      throw new Error(`Unknown media type: ${mediaType}`)
  }
}

function jsonToContent(mediaType: string, json: any): PostContent {
  switch (mediaType) {
    case 'article': {
      const images = (json.images ?? []).map((url: string) => Image.create(url).value)
      return ArticleContent.create(json.body, images).value
    }
    case 'image': {
      const images = (json.images ?? []).map((url: string) => Image.create(url).value)
      return ImageContent.create(images).value
    }
    case 'video':
      return VideoContent.create(json.url, json.durationSeconds).value
    default:
      throw new Error(`Unknown media type: ${mediaType}`)
  }
}
