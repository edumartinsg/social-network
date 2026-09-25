import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { ImageContent } from '@/domain/post/value-objects/image-content'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { VideoContent } from '@/domain/post/value-objects/video-content'
import { Image } from '@/domain/shared/image'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditPostUseCase } from './edit-post-use-case'

function makeArticlePost(overrides?: { authorId?: string }) {
  return Post.create({
    title: PostTitle.create('My Article').value,
    authorId: overrides?.authorId ?? '11111111-1111-4111-8111-111111111111',
    mediaType: MediaType.create('article').value,
    content: ArticleContent.create('a'.repeat(100), []).value,
  }).value
}

function makeImagePost(overrides?: { authorId?: string }) {
  const image = Image.create('https://example.com/photo.jpg').value
  return Post.create({
    title: PostTitle.create('My Images').value,
    authorId: overrides?.authorId ?? '11111111-1111-4111-8111-111111111111',
    mediaType: MediaType.create('image').value,
    content: ImageContent.create([image]).value,
  }).value
}

function makeVideoPost(overrides?: { authorId?: string }) {
  return Post.create({
    title: PostTitle.create('My Video').value,
    authorId: overrides?.authorId ?? '11111111-1111-4111-8111-111111111111',
    mediaType: MediaType.create('video').value,
    content: VideoContent.create('https://example.com/v.mp4', 60).value,
  }).value
}

describe('EditPostUseCase', () => {
  let mockPostRepository: PostRepository
  let useCase: EditPostUseCase

  beforeEach(() => {
    mockPostRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByAuthor: vi.fn().mockResolvedValue([]),
      findMany: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      hardDelete: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn().mockResolvedValue(undefined),
    }
    useCase = new EditPostUseCase(mockPostRepository)
  })

  it("should edit an article's body successfully", async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(makeArticlePost())

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'b'.repeat(100),
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it("should edit an image post's images successfully", async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(makeImagePost())

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      imageUrls: ['https://example.com/new.jpg'],
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it("should edit a video's url and duration successfully", async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(makeVideoPost())

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      videoUrl: 'https://example.com/new.mp4',
      videoDurationSeconds: 90,
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should fail if post is not found', async () => {
    const result = await useCase.execute({
      postId: 'nonexistent',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'a'.repeat(100),
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if post is deleted', async () => {
    const post = makeArticlePost()
    post.deleteByUser()
    mockPostRepository.findById = vi.fn().mockResolvedValue(post)

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'a'.repeat(100),
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if post is under moderation review', async () => {
    const post = makeArticlePost()
    post.deleteByModeration()
    mockPostRepository.findById = vi.fn().mockResolvedValue(post)

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'a'.repeat(100),
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should fail if caller is not the author', async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(
      makeArticlePost({ authorId: 'someone-else' })
    )

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'a'.repeat(100),
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })

  it('should set updatedAt after a successful edit', async () => {
    const post = makeArticlePost()
    mockPostRepository.findById = vi.fn().mockResolvedValue(post)

    expect(post.updatedAt).toBeNull()

    await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'b'.repeat(100),
    })

    expect(post.updatedAt).not.toBeNull()
    expect(post.updatedAt).toBeInstanceOf(Date)
  })

  it('should not save if content validation fails', async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(makeArticlePost())

    const result = await useCase.execute({
      postId: 'post-1',
      authorId: '11111111-1111-4111-8111-111111111111',
      body: 'too short',
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })
})
