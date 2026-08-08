import { EditPostUseCase } from '@/application/post/use-cases/edit-post-use-case'
import { PrismaPostRepository } from '@/infraestructure/database/prisma-post-repository'

// no UserRepository needed here -- authorisation is a comparison against
// post.authorId, already loaded with the post itself. CreatePostUseCase
// needs UserRepository because it must confirm an author EXISTS before
// a post can be attached to them; edit/delete only need to confirm the
// caller IS the author already on record, which the post row already carries.
export function makeEditPostUseCase() {
  const postRepository = new PrismaPostRepository()
  return new EditPostUseCase(postRepository)
}
