import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'
import { Age } from '@/domain/user/value-objects/age'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserId } from '@/domain/user/value-objects/userId'
import { UserName } from '@/domain/user/value-objects/username'
import { describe, expect, it, vi } from 'vitest'
import { GetPostsByAuthorUseCase } from './get-posts-by-author-use-case'

function makeUser(overrides?: { id?: string; username?: string }) {
  return User.create({
    id: overrides?.id ? UserId.create(overrides.id).value : UserId.create().value,
    email: Email.create('john@email.com').value,
    username: UserName.create(overrides?.username ?? 'johndoe').value,
    age: Age.create(25).value,
    password: Password.createHashed('$2b$10$hashedpassword').value,
  }).value
}

function makePost(authorId: string) {
  return Post.create({
    title: PostTitle.create('My Article').value,
    authorId,
    mediaType: MediaType.create('article').value,
    content: ArticleContent.create('a'.repeat(100), []).value,
  }).value
}

function makeMockPostRepository(overrides?: Partial<PostRepository>): PostRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    findByAuthor: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    hardDelete: vi.fn().mockResolvedValue(undefined),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeMockUserRepository(overrides?: Partial<UserRepository>): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    searchByUsername: vi.fn().mockResolvedValue([]),
    findManyByIds: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('GetPostsByAuthorUseCase', () => {
  it('should return the author and their posts on success', async () => {
    const author = makeUser({ id: '11111111-1111-4111-8111-111111111111', username: 'johndoe' })
    const posts = [makePost('11111111-1111-4111-8111-111111111111'), makePost('11111111-1111-4111-8111-111111111111')]

    const userRepository = makeMockUserRepository({
      findByUsername: vi.fn().mockResolvedValue(author),
    })
    const postRepository = makeMockPostRepository({
      findByAuthor: vi.fn().mockResolvedValue(posts),
    })

    const useCase = new GetPostsByAuthorUseCase(postRepository, userRepository)
    const result = await useCase.execute({ username: 'johndoe' })

    expect(result.isSuccess).toBe(true)
    expect(result.value.author).toBe(author)
    expect(result.value.posts).toHaveLength(2)
  })

  it('should look up posts using the resolved author id, not the username', async () => {
    const author = makeUser({ id: '11111111-1111-4111-8111-111111111111', username: 'johndoe' })
    const userRepository = makeMockUserRepository({
      findByUsername: vi.fn().mockResolvedValue(author),
    })
    const postRepository = makeMockPostRepository()

    const useCase = new GetPostsByAuthorUseCase(postRepository, userRepository)
    await useCase.execute({ username: 'johndoe' })

    expect(postRepository.findByAuthor).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111')
  })

  it('should fail if the author does not exist', async () => {
    const userRepository = makeMockUserRepository({
      findByUsername: vi.fn().mockResolvedValue(null),
    })
    const postRepository = makeMockPostRepository()

    const useCase = new GetPostsByAuthorUseCase(postRepository, userRepository)
    const result = await useCase.execute({ username: 'nobody' })

    expect(result.isFailure).toBe(true)
    expect(result.error).toBe('User not found')
    expect(postRepository.findByAuthor).not.toHaveBeenCalled()
  })

  it('should return an empty posts array for an author with no posts, not a failure', async () => {
    const author = makeUser({ id: '11111111-1111-4111-8111-111111111111', username: 'nopostsyet' })
    const userRepository = makeMockUserRepository({
      findByUsername: vi.fn().mockResolvedValue(author),
    })
    const postRepository = makeMockPostRepository({
      findByAuthor: vi.fn().mockResolvedValue([]),
    })

    const useCase = new GetPostsByAuthorUseCase(postRepository, userRepository)
    const result = await useCase.execute({ username: 'nopostsyet' })

    expect(result.isSuccess).toBe(true)
    expect(result.value.posts).toEqual([])
  })
})
