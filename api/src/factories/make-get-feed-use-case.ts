import { GetFeedUseCase } from '@/application/post/use-cases/get-feed-use-case'
import { PostCacheSerializer } from '@/infrastructure/database/post-cache-serializer'
import { PrismaFollowRepository } from '@/infrastructure/database/prisma-follow-repository'
import { PrismaPostRepository } from '@/infrastructure/database/prisma-post-repository'
import { RedisCacheProvider } from '@/infrastructure/services/redis-cache-provider'

export function makeGetFeedUseCase() {
  const postRepository = new PrismaPostRepository()
  const followRepository = new PrismaFollowRepository()
  const cacheProvider = new RedisCacheProvider()
  const postSerializer = new PostCacheSerializer()

  return new GetFeedUseCase(postRepository, followRepository, cacheProvider, postSerializer)
}
