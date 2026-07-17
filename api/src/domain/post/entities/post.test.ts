import { expect, test, describe } from "vitest"
import { Post } from "./post"
import { PostTitle } from "../value-objects/post-title"
import { MediaType } from "../value-objects/media-type"
import { ArticleContent } from "../value-objects/article-content"

describe('Post', () => {

  function makePost() {
    return Post.create({
      title: PostTitle.create("My first post").value,
      mediaType: MediaType.create("article").value,
      content: ArticleContent.create("a".repeat(100), []).value,
      authorId: "author-123",
    }).value
  }

  test("should create a post", () => {
    const post = makePost()
    expect(post).toBeInstanceOf(Post)
    expect(post.title.value).toBe("My first post")
    expect(post.mediaType.value).toBe("article")
    expect(post.authorId).toBe("author-123")
    expect(post.createdAt).toBeInstanceOf(Date)
    expect(post.updatedAt).toBeNull()
    expect(post.deletedAt).toBeNull()
  })

  test("should edit a post", () => {
    const post = makePost()
    const newContent = ArticleContent.create("b".repeat(100), []).value

    post.edit(newContent)

    expect(post.content).toBe(newContent)
    expect(post.updatedAt).not.toBeNull()
    expect(post.updatedAt).toBeInstanceOf(Date)
  })

  test("should soft delete a post when deleted by user", () => {
    const post = makePost()
    post.deleteByUser()

    expect(post.deletedAt).not.toBeNull()
    expect(post.deletedAt).toBeInstanceOf(Date)
    expect(post.isDeletedByModeration).toBe(false)
  })

  test("should soft delete and flag a post when deleted by moderation", () => {
    const post = makePost()
    post.deleteByModeration()

    expect(post.deletedAt).not.toBeNull()
    expect(post.isDeletedByModeration).toBe(true)
  })

  test("should fail article content with less than 100 characters", () => {
    const result = ArticleContent.create("too short", [])
    expect(result.isFailure).toBe(true)
  })

  test("should fail article content exceeding 5000 characters", () => {
    const result = ArticleContent.create("a".repeat(5001), [])
    expect(result.isFailure).toBe(true)
  })
})