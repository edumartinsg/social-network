import { Post } from './../entities/post';

export interface PostRepository {
  findById(id: string): Promise<Post | null>
  findByAuthor(authorId: string): Promise<Post[] >
  save(post: Post): Promise<void>
  hardDelete(id: string): Promise<void>  // user deletion
  softDelete(post: Post): Promise<void>  // moderation deletion
}

