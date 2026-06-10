import { Image } from "@/domain/shared/image";
import { Result } from "@/domain/shared/result"

export class ImageContent {

  private constructor(private readonly _images: Image[]) {}
  public static create(images: Image[]): Result<ImageContent> {
    if (!images || images.length === 0) {
      return Result.fail('At least one image is required')
    }
    if (images.length > 10) {
      return Result.fail('Cannot have more than 10 images')
    }
    return Result.ok(new ImageContent(images))
  }
      

  get images(): Image[] {
    return this._images;
  }
}