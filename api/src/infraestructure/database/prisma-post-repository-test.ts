import { describe, it, expect, afterEach, afterAll, beforeEach } from 'vitest'
import { prisma } from './lib/prisma'
import { PrismaPostRepository } from './prisma-post-repository'
import { PrismaUserRepository } from './prisma-user-repository'
import { Post } from '@/domain/post/entities/post'
import { PostTitle } from '@/domain/post/value-objects/post-title'
import { MediaType } from '@/domain/post/value-objects/media-type'
import { ArticleContent } from '@/domain/post/value-objects/article-content'
import { VideoContent } from '@/domain/post/value-objects/video-content'
import { User } from '@/domain/user/entities/user'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserName } from '@/domain/user/value-objects/username'
import { Age } from '@/domain/user/value-objects/age'
import { UserId } from '@/domain/user/value-objects/userId'

// a post needs a real author in the DB because of the foreign key
async function createAuthor(): Promise<string> {
  const userRepo = new PrismaUserRepository()
  const user = User.create({
    id: UserId.create().value,
    email: Email.create('author@email.com').value,
    username: UserName.create('author').value,
    age: Age.create(25).value,
    password: Password.createHashed('$2b$10$hash').value,
    name: 'Author',
  }).value
  await userRepo.save(user)
  return user.id.value
}

function makeArticlePost(authorId: string) {
  return Post.create({
    title: PostTitle.create('My Article').value,
    authorId,
    mediaType: MediaType.create('article').value,
    content: ArticleContent.create('a'.repeat(100), []).value,
  }).value
}

describe('PrismaPostRepository', () => {
  const repo = new PrismaPostRepository()

  afterEach(async () => {
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should save and retrieve an article post by id', async () => {
    const authorId = await createAuthor()
    const post = makeArticlePost(authorId)

    await repo.save(post)

    const found = await repo.findById(post.postId)

    expect(found).not.toBeNull()
    expect(found?.title.value).toBe('My Article')
    expect(found?.mediaType.value).toBe('article')
  })

  it('should return null when post not found', async () => {
    const found = await repo.findById('non-existent-id')
    expect(found).toBeNull()
  })

  it('should preserve content when saving and retrieving a video post', async () => {
    const authorId = await createAuthor()
    const post = Post.create({
      title: PostTitle.create('My Video').value,
      authorId,
      mediaType: MediaType.create('video').value,
      content: VideoContent.create('https://example.com/v.mp4', 120).value,
    }).value

    await repo.save(post)
    const found = await repo.findById(post.postId)

    // proves the JSON serialisation round-trip works
    const content = found?.content as VideoContent
    expect(content.url).toBe('https://example.com/v.mp4')
    expect(content.durationSeconds).toBe(120)
  })

  it('should find all posts by an author', async () => {
    const authorId = await createAuthor()
    await repo.save(makeArticlePost(authorId))
    await repo.save(makeArticlePost(authorId))

    const posts = await repo.findByAuthor(authorId)
    expect(posts).toHaveLength(2)
  })

  it('should hard delete a post', async () => {
    const authorId = await createAuthor()
    const post = makeArticlePost(authorId)
    await repo.save(post)

    await repo.hardDelete(post.postId)

    const found = await repo.findById(post.postId)
    expect(found).toBeNull()
  })

  it('should soft delete a post by moderation', async () => {
    const authorId = await createAuthor()
    const post = makeArticlePost(authorId)
    await repo.save(post)

    post.deleteByModeration()
    await repo.softDelete(post)

    const row = await prisma.post.findUnique({ where: { id: post.postId } })
    expect(row?.deletedAt).not.toBeNull()
    expect(row?.isDeletedByModeration).toBe(true)
  })
})