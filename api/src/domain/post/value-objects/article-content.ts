import { Result } from "@/domain/shared/result"
import { Image } from "../../shared/image"

export class ArticleContent {
  private constructor(
    private readonly _body: string,
    private readonly _images: Image[]  // 👈 store images
  ) {}

  public static create(body: string, images: Image[] = []): Result<ArticleContent> {
    if (!body || body.trim().length < 100) {
      return Result.fail('Article body must be at least 100 characters')
    }
    if (body.length > 5000) {
      return Result.fail('Article body cannot exceed 5000 characters')
    }
    if (images.length > 10) {
      return Result.fail('Article cannot have more than 10 images')
    }
    return Result.ok(new ArticleContent(body, images))
  }

  get body(): string { return this._body }
  get images(): Image[] { return this._images }
}