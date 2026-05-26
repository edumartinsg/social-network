import { Result } from "@/domain/shared/result"

export class PostContent {
  private constructor(private readonly content: string) {}

  public static create(content: string): Result<PostContent> {
    if (!content || content.trim().length === 0) {
      return Result.fail('Content cannot be empty')
    }
    if (content.length > 5000) {
      return Result.fail('Content cannot exceed 5000 characters')
    }
    return Result.ok(new PostContent(content))
  }

  get value(): string {
    return this.content
  }
}