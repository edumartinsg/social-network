import { env } from '@/env'
import { Queue } from 'bullmq'

export const embeddingQueue = new Queue('post-embedding', {
  connection: { url: env.REDIS_URL },
})
