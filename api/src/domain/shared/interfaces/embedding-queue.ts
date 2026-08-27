
export interface EmbeddingQueue {
  enqueue(postId: string, text: string): Promise<void>
}
