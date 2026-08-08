import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/PostRepository'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { ImageContent } from '@/domain/post/value-objects/image-content'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { PostCaption } from '@/domain/post/value-objects/post-caption'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { VideoContent } from '@/domain/post/value-objects/video-content'
import { Image } from '@/domain/shared/image'
import { prisma } from './lib/prisma'

export class PrismaPostRepository implements PostRepository {

  async findById(id: string): Promise<Post | null> {
    const row = await prisma.post.findUnique({ where: { id } })
    if (!row) return null
    return this.toDomain(row)
  }

  async findMany(params: {
  authorIdIn?: string[]
  authorIdNotIn?: string[]
  cursor?: string
  limit: number
}): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    take: params.limit,
    skip: params.cursor ? 1 : 0,
    cursor: params.cursor ? { id: params.cursor } : undefined,
    where: {
      deletedAt: null,
      isDeletedByModeration: false,
      ...(params.authorIdIn ? { authorId: { in: params.authorIdIn } } : {}),
      ...(params.authorIdNotIn ? { authorId: { notIn: params.authorIdNotIn } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map(row => this.toDomain(row))
}

  async findByAuthor(authorId: string): Promise<Post[]> {
    const rows = await prisma.post.findMany({ where: { authorId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(post: Post): Promise<void> {
    const data = this.toPersistence(post)
    await prisma.post.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    })
  }

  // user deletion — removes the row entirely
  async hardDelete(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } })
  }

  // moderation deletion — persists the soft-deleted state
  async softDelete(post: Post): Promise<void> {
    const data = this.toPersistence(post)
    await prisma.post.update({
      where: { id: data.id },
      data,
    })
  }

  // DB row → domain object
  private toDomain(row: any): Post {
    const content = this.jsonToContent(row.mediaType, row.content)

    const caption = row.caption
      ? PostCaption.create(row.caption).value
      : null

    return Post.create({
      id: row.id,
      title: PostTitle.create(row.title).value,
      caption,
      authorId: row.authorId,
      mediaType: MediaType.create(row.mediaType).value,
      content,
      createdAt: row.createdAt,
    }).value
  }

  // domain object → DB row
  private toPersistence(post: Post) {
    return {
      id: post.postId,
      title: post.title.value,
      caption: post.caption?.value ?? null,
      authorId: post.authorId,
      mediaType: post.mediaType.value,
      content: this.contentToJson(post.mediaType.value, post.content),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt ?? null,
      deletedAt: post.deletedAt ?? null,
      isDeletedByModeration: post.isDeletedByModeration,
    }
  }

  // serialise the content Value Object into plain JSON for the DB
  private contentToJson(mediaType: string, content: any): any {
    switch (mediaType) {
      case 'article':
        return { body: content.body, images: content.images.map((i: Image) => i.url) }
      case 'image':
        return { images: content.images.map((i: Image) => i.url) }
      case 'video':
        return { url: content.url, durationSeconds: content.durationSeconds }
      default:
        throw new Error(`Unknown media type: ${mediaType}`)
    }
  }

  // rebuild the correct content Value Object from stored JSON
  private jsonToContent(mediaType: string, json: any) {
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
}
