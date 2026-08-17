import { EmbeddingProvider } from '@/domain/shared/interfaces/embedding-provider'
import { env } from '@/env'

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${env.OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
    })
    const data = (await response.json() as { embedding: number[] })
    return data.embedding
  }
}
