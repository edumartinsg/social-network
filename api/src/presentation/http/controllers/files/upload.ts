// import { makeUploadFileUseCase } from '@/factories/make-upload-file-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

import { uploadQueue } from '@/infrastructure/queue/upload-queue'

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
  const data = await request.file()

  if (!data) {
    return reply.status(400).send({ message: 'No file provided' })
  }

  const buffer = await data.toBuffer()

  const job = await uploadQueue.add('upload', {
    buffer: buffer.toString('base64'),
    fileName: data.filename,
    contentType: data.mimetype,
  })

  return reply.status(202).send({ jobId: job.id })
}
