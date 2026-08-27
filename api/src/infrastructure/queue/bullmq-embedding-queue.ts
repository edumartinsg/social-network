// src/infrastructure/queue/bullmq-embedding-queue.ts
import { EmbeddingQueue } from '@/domain/shared/interfaces/embedding-queue'
import { embeddingQueue } from './embedding-queue'

export class BullMQEmbeddingQueue implements EmbeddingQueue {
  async enqueue(postId: string, text: string): Promise<void> {
    await embeddingQueue.add('post-embedding', { postId, text })
  }
}
