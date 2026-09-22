import { Post } from '@/domain/post/entities/post'
import { PostSerializer } from '@/domain/shared/interfaces/post-serializer'
import { dtoToPost, PostDTO, postToDTO } from './post-mapper'

// Why this is a separate class rather than GetFeedUseCase calling
// JSON.stringify/JSON.parse directly, which is the bug this fixes: a bare
// JSON.stringify(post) only captures own enumerable properties. Post's
// actual data lives inside `props` on the base Entity class, and its
// getters (title, mediaType, content) are not own properties at all --
// they are inherited accessors. JSON.stringify silently drops what it
// cannot see, and JSON.parse has no way to know a plain object was ever
// supposed to be a Post, so it never reconstructs the Value Objects or
// their .value getters. The result was cache hits returning objects that
// looked like posts in a debugger but crashed the moment code called
// post.mediaType.value, because .mediaType existed as flattened data but
// no longer had a .value getter on it.
export class PostCacheSerializer implements PostSerializer {
  serialize(posts: Post[]): string {
    const dtos: PostDTO[] = posts.map(postToDTO)
    return JSON.stringify(dtos)
  }

  deserialize(json: string): Post[] {
    const dtos: PostDTO[] = JSON.parse(json)
    return dtos.map(dtoToPost)
  }
}
