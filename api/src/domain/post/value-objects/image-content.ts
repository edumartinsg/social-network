import { Result } from "@/domain/shared/result"
import { Image } from "@/domain/shared/image"

// RECONSTRUCTED: corrected version using Image[] instead of string[],
// as discussed in the conversation. Verify against your last known-good
// version if available.
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
    return this._images
  }
}
