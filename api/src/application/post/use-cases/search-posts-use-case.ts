import { EmbeddingProvider } from '@/domain/shared/interfaces/embedding-provider'
import { prisma } from '@/infraestructure/database/lib/prisma'

interface SearchPostsUseCaseRequest {
  query: string
  limit?: number
}

interface SearchResult {
  postId: string
  title: string
  similarity: number
}

export class SearchPostsUseCase {
  constructor(private embeddingProvider: EmbeddingProvider) {}

  public async execute(request: SearchPostsUseCaseRequest): Promise<SearchResult[]> {
    const queryEmbedding = await  this.embeddingProvider.embed(request.query)
    const limit = request.limit ?? 10

    return prisma.$queryRaw<SearchResult[]>`
      SELECT
        id as "postId",
        title,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM posts
      WHERE embedding IS NOT NULL
        AND "deletedAt" IS NULL
        AND "isDeletedByModeration" = false
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `
  }
}
