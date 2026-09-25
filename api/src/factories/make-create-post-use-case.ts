import { CreatePostUseCase } from '@/application/post/use-cases/create-post-use-case';
import { PrismaPostRepository } from '@/infrastructure/database/prisma-post-repository';
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository';
import { BullMQEmbeddingQueue } from '@/infrastructure/queue/bullmq-embedding-queue';

// src/factories/make-create-post-use-case.ts
export function makeCreatePostUseCase() {
  const postRepository = new PrismaPostRepository()
  const userRepository = new PrismaUserRepository()
  const embeddingQueue = new BullMQEmbeddingQueue()
  return new CreatePostUseCase(postRepository, userRepository, embeddingQueue)
}
