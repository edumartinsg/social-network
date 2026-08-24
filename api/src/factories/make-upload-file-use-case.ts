import { UploadFileUseCase } from '@/application/shared/use-cases/upload-file-use-case'
import { S3Storage } from '@/infrastructure/services/s3-storage'

export function makeUploadFileUseCase() {
  return new UploadFileUseCase(new S3Storage())
}
