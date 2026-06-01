import { expect, test } from "vitest"
import { Post } from "./post"
import { PostContent } from "../value-objects/post-content"


    //Create a post to be used in the tests
        function makePost() {
            return Post.create({
                content: PostContent.create("Hello World!").value,
                authorId: "author-123",
            }).value
        }

    test("should create a post", () => {
        const post = makePost()
        expect(post).toBeInstanceOf(Post)
        expect(post.content.value).toBe("Hello World!")
        expect(post.authorId).toBe("author-123")
        expect(post.createdAt).toBeInstanceOf(Date)
        expect(post.updatedAt).toBeNull()
        })


    test("should edit a post", () => {
          const post = makePost()
        post.edit(PostContent.create("Updated Content").value)
        expect(post.content.value).toBe("Updated Content")
        expect(post.updatedAt).not.toBeNull() 
        expect(post.updatedAt).toBeInstanceOf(Date) 
    })

    test("should delete a post", () => {
        const post = makePost()
        post.delete()
    })

    test("should fail with empty content", () => {
        const result = PostContent.create("")
        expect(result.isFailure).toBe(true)
        expect(result.error).toBe("Content cannot be empty")
    })

    test("should fail with content exceeding 5000 characters", () => {
        const result = PostContent.create("a".repeat(5001))
        expect(result.isFailure).toBe(true)
        expect(result.error).toBe("Content cannot exceed 5000 characters")
    })
