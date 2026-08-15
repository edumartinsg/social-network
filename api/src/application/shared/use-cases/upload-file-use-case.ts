import { FileStorage } from "@/domain/shared/interfaces/files-storage"
import { Result } from "@/domain/shared/result"

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024  // 100MB

interface UploadFileUseCaseRequest {
  buffer: Buffer
  fileName: string
  contentType: string
}

export class UploadFileUseCase {
  constructor(private fileStorage: FileStorage) {}

  public async execute(request: UploadFileUseCaseRequest): Promise<Result<{ url: string }>> {

    if (!ALLOWED_CONTENT_TYPES.includes(request.contentType)) {
      return Result.fail('File type not allowed')
    }

    const isVideo = request.contentType.startsWith('video/')
    const sizeLimit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

    if (request.buffer.length > sizeLimit) {
      return Result.fail('File exceeds the maximum allowed size')
    }

    const url = await this.fileStorage.upload(request)

    return Result.ok({ url })
  }
}
