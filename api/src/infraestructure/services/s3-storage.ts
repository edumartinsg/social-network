import { FileStorage } from '@/domain/shared/interfaces/files-storage'
import { env } from '@/env'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

export class S3Storage implements FileStorage {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region:  env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true, // required for MinIO, not for real AWS S3
    })
  }

  async upload(params: { buffer: Buffer; fileName: string; contentType: string }): Promise<string> {
    const key = `${randomUUID()}-${params.fileName}`

    await this.client.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
    }))

    return `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/${key}`
  }
}
