import { env } from '@/env'
import { Worker } from 'bullmq'
import { prisma } from '../../database/lib/prisma'
import { OllamaEmbeddingProvider } from '../../services/ollama-embedding-provider'

const worker = new Worker(
  'post-embedding',
  async (job) => {
    const { postId, text } = job.data
    const embeddingProvider = new OllamaEmbeddingProvider()
    const embedding = await embeddingProvider.embed(text)

    await prisma.$executeRaw`
      UPDATE posts SET embedding = ${embedding}::vector WHERE id = ${postId}::uuid
    `

    return { postId, status: 'embedded' }
  },
  { connection: { url: env.REDIS_URL } }
)

worker.on('completed', (job) => console.log(`Embedding job ${job.id} completed`))
worker.on('failed', (job, err) => console.error(`Embedding job ${job?.id} failed:`, err.message))
