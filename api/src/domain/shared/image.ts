import { Result } from "@/domain/shared/result"

export class Image {
  private constructor(private readonly _url: string) {} // one URL per Image

  public static create(url: string): Result<Image> {
    if (!url || url.trim().length === 0) {
      return Result.fail('Image URL is required')
    }
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/.test(url)) {
      return Result.fail('Invalid image URL format')
    }
    return Result.ok(new Image(url))
    
  }

  get url(): string { return this._url }
}