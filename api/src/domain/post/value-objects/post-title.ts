import { Result } from "@/domain/shared/result"

export class PostTitle {
  private constructor(private readonly content: string) {}

  public static create(content: string): Result<PostTitle> {
    if (!content || content.trim().length === 0) {
      return Result.fail('Title cannot be empty')
    }
    if (content.length > 100) {
      return Result.fail('Title cannot exceed 100 characters')
    }

    if(content.length <3 ){
        return Result.fail('Title must be at least 3 characters long')
    } 
    return Result.ok(new PostTitle(content))
  }

  get value(): string {
    return this.content
  }
}