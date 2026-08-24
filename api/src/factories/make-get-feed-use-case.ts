// factories/make-get-feed-use-case.ts
import { GetFeedUseCase } from '@/application/post/use-cases/get-feed-use-case'
import { PrismaFollowRepository } from '@/infrastructure/database/prisma-follow-repository'
import { PrismaPostRepository } from '@/infrastructure/database/prisma-post-repository'
import { RedisCacheProvider } from '@/infrastructure/services/redis-cache-provider'

export function makeGetFeedUseCase() {
  return new GetFeedUseCase(
    new PrismaPostRepository(),
    new PrismaFollowRepository(),
    new RedisCacheProvider()
  )
}
