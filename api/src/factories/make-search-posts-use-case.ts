// factories/make-search-posts-use-case.ts
import { SearchPostsUseCase } from '@/application/post/use-cases/search-posts-use-case'
import { OllamaEmbeddingProvider } from '@/infraestructure/services/ollama-embedding-provider'

export function makeSearchPostsUseCase() {
  return new SearchPostsUseCase(new OllamaEmbeddingProvider())
}
