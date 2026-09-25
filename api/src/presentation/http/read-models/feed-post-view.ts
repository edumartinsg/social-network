import { Post } from '@/domain/post/entities/post'
import { ImageContent } from '@/domain/post/value-objects/image-content'
import { VideoContent } from '@/domain/post/value-objects/video-content'
import { User } from '@/domain/user/entities/user'

// A read-model, not the Post entity itself. The frontend's PostCard needs
// one flat mediaUrl to render, not a content union to branch on -- pushing
// that flattening in here keeps the union-type complexity (ADR-006) out of
// the API contract, where every consumer would otherwise have to re-learn
// how to read ArticleContent | ImageContent | VideoContent.
export interface FeedPostView {
  id: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  caption: string | null
  authorUsername: string
  createdAt: string
}

// Integration note: call this from wherever GetFeedUseCase currently builds
// its response array, once per post, with the post's already-loaded author.
// Article posts are left out on purpose -- the brief scopes this feed UI to
// images and videos only, matching the "utilizaremos apenas imagens e
// videos por enquanto" instruction. Filter articles out before mapping,
// not inside this function, so this function never has to decide what an
// article-only post reduces to.
export function toFeedPostView(post: Post, author: User): FeedPostView {
  const mediaUrl =
    post.content instanceof ImageContent
      ? post.content.images[0]?.url ?? ''
      : post.content instanceof VideoContent
        ? post.content.url
        : ''

  return {
    id: post.postId,
    mediaType: post.mediaType.value as 'image' | 'video',
    mediaUrl,
    caption: post.caption?.value ?? null,
    authorUsername: author.username.value,
    createdAt: post.createdAt.toISOString(),
  }
}
