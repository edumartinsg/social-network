import { PrismaPostRepository } from '@/infraestructure/database/prisma-post-repository';
import { CreatePostUseCase } from '@/application/post/use-cases/create-post-use-case';
import { PrismaUserRepository } from '@/infraestructure/database/prisma-user-repository';

export function makeCreatePostUseCase() {
  const postRepository = new PrismaPostRepository()
  const userRepository = new PrismaUserRepository()
  const createPostUseCase = new CreatePostUseCase(postRepository, userRepository)

  return createPostUseCase
}
