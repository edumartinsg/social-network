// application/post/use-cases/search-posts-use-case.test.ts
import { EmbeddingProvider } from '@/domain/shared/interfaces/embedding-provider'
import { describe, expect, it, vi } from 'vitest'
import { SearchPostsUseCase } from './search-posts-use-case'

describe('SearchPostsUseCase', () => {
  it('should embed the query text before searching', async () => {
    const mockEmbeddingProvider: EmbeddingProvider = {
      embed: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
    }
    const useCase = new SearchPostsUseCase(mockEmbeddingProvider)

    await useCase.execute({ query: 'dog training tips' })

    expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith('dog training tips')
  })
})
