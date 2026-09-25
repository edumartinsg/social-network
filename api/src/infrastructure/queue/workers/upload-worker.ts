import { UploadFileUseCase } from '@/application/shared/use-cases/upload-file-use-case'
import { env } from '@/env'
import { Worker } from 'bullmq'
import { S3Storage } from '../../services/s3-storage'

const worker = new Worker(
  'file-upload',
  async (job) => {
    const uploadFileUseCase = new UploadFileUseCase(new S3Storage())

    const result = await uploadFileUseCase.execute({
      buffer: Buffer.from(job.data.buffer, 'base64'),
      fileName: job.data.fileName,
      contentType: job.data.contentType,
    })

    if (result.isFailure) {
      throw new Error(result.error) // BullMQ marks the job as failed
    }

    return { url: result.value.url }
  },
  { connection: { url: env.REDIS_URL } }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})
