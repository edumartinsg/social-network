import { GetPostsByAuthorUseCase } from '@/application/post/use-cases/get-posts-by-author-use-case'
import { PrismaPostRepository } from '@/infrastructure/database/prisma-post-repository'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'

export function makeGetPostsByAuthorUseCase() {
  const postRepository = new PrismaPostRepository()
  const userRepository = new PrismaUserRepository()
  return new GetPostsByAuthorUseCase(postRepository, userRepository)
}
