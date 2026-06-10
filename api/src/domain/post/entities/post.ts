import { Entity } from '@/domain/shared/entity'
import { Result } from '@/domain/shared/result'
import { randomUUID } from 'crypto'
import { MediaType } from '../value-objects/media-type'
import { PostTitle } from '../value-objects/post-title'
import { PostCaption } from '../value-objects/post-caption'
import { VideoContent } from '../value-objects/video-content'
import { ImageContent } from '../value-objects/image-content'
import { ArticleContent } from '../value-objects/article-content'

export type PostContent = VideoContent | ImageContent | ArticleContent

export interface PostProps {
  postId: string
  title: PostTitle
  caption: PostCaption | null
  authorId: string
  mediaType: MediaType
  content: PostContent
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
  isDeletedByModeration: boolean
}

export class Post extends Entity<PostProps> {
  private constructor(props: PostProps) {
    super(props)
  }

  public static create(props: {
    id?: string
    title: PostTitle
    caption?: PostCaption | null
    authorId: string
    mediaType: MediaType
    content: PostContent
    createdAt?: Date
  }): Result<Post> {
    const now = new Date()

    const post = new Post({
      postId: props.id ?? randomUUID(),
      title: props.title,
      caption: props.caption ?? null,
      authorId: props.authorId,
      mediaType: props.mediaType,
      content: props.content,
      createdAt: props.createdAt ?? now,
      updatedAt: null,
      deletedAt: null,
      isDeletedByModeration: false,
    })

    return Result.ok(post)
  }

  // user edits their own post content
  public edit(newContent: PostContent): void {
    this.props.content = newContent
    this.props.updatedAt = new Date()
  }

  // user deletes their own post — hard delete signal
  // actual removal from DB happens in the use case + repository
  public deleteByUser(): void {
    this.props.deletedAt = new Date()
  }

  // moderation deletes post — goes to QuarantineZone
  public deleteByModeration(): void {
    this.props.deletedAt = new Date()
    this.props.isDeletedByModeration = true
  }

  // getters
  get postId(): string { return this.props.postId }
  get title(): PostTitle { return this.props.title }
  get caption(): PostCaption | null { return this.props.caption }
  get authorId(): string { return this.props.authorId }
  get mediaType(): MediaType { return this.props.mediaType }
  get content(): PostContent { return this.props.content }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date | null { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }
  get isDeletedByModeration(): boolean { return this.props.isDeletedByModeration }
}