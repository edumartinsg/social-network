import { CreatePostUseCase } from '@/application/post/use-cases/create-post-use-case';
import { PrismaPostRepository } from '@/infrastructure/database/prisma-post-repository';
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository';

export function makeCreatePostUseCase() {
  const postRepository = new PrismaPostRepository()
  const userRepository = new PrismaUserRepository()
  const createPostUseCase = new CreatePostUseCase(postRepository, userRepository)

  return createPostUseCase
}
