// factories/make-get-feed-use-case.ts
import { GetFeedUseCase } from '@/application/post/use-cases/get-feed-use-case'
import { PrismaFollowRepository } from '@/infraestructure/database/prisma-follow-repository'
import { PrismaPostRepository } from '@/infraestructure/database/prisma-post-repository'
import { RedisCacheProvider } from '@/infraestructure/services/redis-cache-provider'

export function makeGetFeedUseCase() {
  return new GetFeedUseCase(
    new PrismaPostRepository(),
    new PrismaFollowRepository(),
    new RedisCacheProvider()
  )
}
