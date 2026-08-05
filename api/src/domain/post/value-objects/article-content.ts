import { Result } from "@/domain/shared/result"
import { Image } from "@/domain/shared/image"

// RECONSTRUCTED: this reflects the corrected version discussed in the
// conversation (storing images in the constructor). The exact final
// pasted file was not shown verbatim after the fix was suggested —
// verify against your last known-good version if you have one.
export class ArticleContent {
  private constructor(
    private readonly _body: string,
    private readonly _images: Image[]
  ) {}

  public static create(body: string, images: Image[] = []): Result<ArticleContent> {
    if (!body || body.trim().length === 0 || body.trim().length < 100) {
      return Result.fail('Content cannot be empty and must be at least 100 characters long')
    }
    if (body.length > 5000) {
      return Result.fail('Content cannot exceed 5000 characters')
    }
    if (images.length > 10) {
      return Result.fail('Cannot have more than 10 images for article content')
    }
    return Result.ok(new ArticleContent(body, images))
  }

  get body(): string {
    return this._body
  }

  get images(): Image[] {
    return this._images
  }

  // kept for backward compatibility with earlier code that read `.value`
  get value(): string {
    return this._body
  }
}
