import { Post } from "../entities/post"

// RECONSTRUCTED: interface was referenced throughout the conversation
// (implemented by PrismaPostRepository) but never pasted in full.
// This reflects the method signatures actually used against it.
export interface PostRepository {
  findById(id: string): Promise<Post | null>
  findMany(params: {
    authorIdIn?: string[]
    authorIdNotIn?: string[]
    cursor?: string
    limit: number
  }): Promise<Post[]>
  findByAuthor(authorId: string): Promise<Post[]>
  save(post: Post): Promise<void>
  hardDelete(id: string): Promise<void>   // user deletion
  softDelete(post: Post): Promise<void>   // moderation deletion
}
