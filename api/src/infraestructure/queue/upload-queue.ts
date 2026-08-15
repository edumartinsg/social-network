import { env } from '@/env'
import { Queue } from 'bullmq'

export const uploadQueue = new Queue('file-upload', {
  connection: { url: env.REDIS_URL },
})
