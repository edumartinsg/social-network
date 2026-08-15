import { Result } from "@/domain/shared/result"

export class PostCaption {
  private constructor(private readonly content: string | null) {}

  public static create(content: string): Result<PostCaption> {
    if (!content || content.trim().length === 0) {
      return Result.fail('Caption cannot be empty')
    }
    if (content.length > 500) {
      return Result.fail('Caption cannot exceed 500 characters')
    }

    return Result.ok(new PostCaption(content))

  }

  get value(): string {
    return this.content || ''
  }
}
