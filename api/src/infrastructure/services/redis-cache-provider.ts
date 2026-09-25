import { CacheProvider } from '@/domain/shared/interfaces/cache-provider'
import { env } from '@/env'
import Redis from 'ioredis'

const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times) => {
    if (times > 3) return null // desiste depois de 3 tentativas, evita flood infinito de logs
    return Math.min(times * 200, 2000)
  },
})

export class RedisCacheProvider implements CacheProvider {
  async get(key: string): Promise<string | null> {
    return redis.get(key)
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.set(key, value, 'EX', ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    await redis.del(key)
  }
}
