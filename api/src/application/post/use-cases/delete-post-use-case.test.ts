import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/PostRepository'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeletePostUseCase } from './delete-post-use-case'

function makePost(overrides?: { authorId?: string }) {
  return Post.create({
    title: PostTitle.create('My Article').value,
    authorId: overrides?.authorId ?? 'author-123',
    mediaType: MediaType.create('article').value,
    content: ArticleContent.create('a'.repeat(100), []).value,
  }).value
}

describe('DeletePostUseCase', () => {
  let mockPostRepository: PostRepository
  let useCase: DeletePostUseCase

  beforeEach(() => {
    mockPostRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByAuthor: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
      hardDelete: vi.fn().mockResolvedValue(undefined),
      softDelete: vi.fn().mockResolvedValue(undefined),
    }
    useCase = new DeletePostUseCase(mockPostRepository)
  })

  it('should hard delete when the author deletes their own post', async () => {
    const post = makePost()                                        // 👈 precisa existir essa linha
    mockPostRepository.findById = vi.fn().mockResolvedValue(post)

    const result = await useCase.execute({
      postId: 'post-1',
      requesterId: 'author-123',
      isModerationAction: false,
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.hardDelete).toHaveBeenCalledWith(post.postId)  // 👈 e essa mudança
    expect(mockPostRepository.softDelete).not.toHaveBeenCalled()
  })

  it('should soft delete and flag the post when moderation deletes it', async () => {
    const post = makePost()
    mockPostRepository.findById = vi.fn().mockResolvedValue(post)

    const result = await useCase.execute({
      postId: 'post-1',
      requesterId: 'moderator-999', // note: not the author -- irrelevant on this path
      isModerationAction: true,
    })

    expect(result.isSuccess).toBe(true)
    expect(mockPostRepository.softDelete).toHaveBeenCalledTimes(1)
    expect(mockPostRepository.hardDelete).not.toHaveBeenCalled()
    expect(post.isDeletedByModeration).toBe(true)
  })

  it('should fail if post is not found', async () => {
    const result = await useCase.execute({
      postId: 'nonexistent',
      requesterId: 'author-123',
      isModerationAction: false,
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.hardDelete).not.toHaveBeenCalled()
    expect(mockPostRepository.softDelete).not.toHaveBeenCalled()
  })

  it('should fail if a non-moderation caller is not the author', async () => {
    mockPostRepository.findById = vi.fn().mockResolvedValue(
      makePost({ authorId: 'someone-else' })
    )

    const result = await useCase.execute({
      postId: 'post-1',
      requesterId: 'author-123',
      isModerationAction: false,
    })

    expect(result.isFailure).toBe(true)
    expect(mockPostRepository.hardDelete).not.toHaveBeenCalled()
  })

  it('should not call either delete method on any failure path', async () => {
    await useCase.execute({
      postId: 'nonexistent',
      requesterId: 'author-123',
      isModerationAction: false,
    })

    expect(mockPostRepository.hardDelete).not.toHaveBeenCalled()
    expect(mockPostRepository.softDelete).not.toHaveBeenCalled()
  })
})
