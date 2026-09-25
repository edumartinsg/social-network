import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { Prisma } from '@prisma/client'
import { prisma } from './lib/prisma'
import { dtoToPost, PostDTO, postToDTO } from './post-mapper'

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

  async hardDelete(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } })
  }

  async softDelete(post: Post): Promise<void> {
    const data = this.toPersistence(post)
    await prisma.post.update({
      where: { id: data.id },
      data,
    })
  }

  private toDomain(row: any): Post {
    return dtoToPost(row as PostDTO)
  }

  // WHY THE CAST HERE: postToDTO deliberately types `content` as `unknown`
  // in post-mapper.ts, because that module has no business knowing about
  // Prisma's generated types -- it is shared with PostCacheSerializer,
  // which has nothing to do with a database at all. `unknown` is the
  // honest type for "opaque JSON blob" from the mapper's point of view.
  //
  // Prisma, on the other hand, wants a specific type (InputJsonValue) for
  // anything written into a Json column, so it can distinguish "write this
  // value" from "explicitly write SQL NULL" (JsonNull) from "leave this
  // field alone" (undefined). That specificity is Prisma's concern, not
  // the domain mapper's, so the cast happens right here, at the one
  // boundary where a generic DTO becomes a Prisma write. This is the same
  // reasoning as the boundary in Post.toPersistence originally -- the
  // repository is exactly where domain-shaped data becomes
  // database-shaped data, so a Prisma-specific type assertion belongs
  // here and nowhere upstream of it.
  private toPersistence(post: Post) {
    const dto = postToDTO(post)
    return {
      ...dto,
      content: dto.content as Prisma.InputJsonValue,
    }
  }
}
