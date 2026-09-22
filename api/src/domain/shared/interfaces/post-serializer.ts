import { Post } from '@/domain/post/entities/post'

// Why this interface exists: GetFeedUseCase needs to turn Post[] into a
// cacheable string and back, but it must not know HOW -- that "how" is
// infrastructure knowledge (the exact JSON shape, which mapper to call).
// Same reasoning as EmbeddingQueue: the use case declares what it needs,
// an infrastructure class provides it, and a factory wires the two.
export interface PostSerializer {
  serialize(posts: Post[]): string
  deserialize(json: string): Post[]
}
