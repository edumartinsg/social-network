import { CacheProvider } from '@/domain/shared/interfaces/cache-provider'
import { env } from '@/env'
import Redis from 'ioredis'

const redis = new Redis(env.REDIS_URL)

export class RedisCacheProvider implements CacheProvider {
  async get(key: string): Promise<string | null> {
    return redis.get(key)
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    // 'EX' sets the expiration in seconds atomically with the write --
    // this is Redis's native TTL mechanism, not something we manage manually
    await redis.set(key, value, 'EX', ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    await redis.del(key)
  }
}
