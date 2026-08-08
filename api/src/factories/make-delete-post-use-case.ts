import { DeletePostUseCase } from '@/application/post/use-cases/delete-post-use-case'
import { PrismaPostRepository } from '@/infraestructure/database/prisma-post-repository'

export function makeDeletePostUseCase() {
  const postRepository = new PrismaPostRepository()
  return new DeletePostUseCase(postRepository)
}
