import { uploadQueue } from '@/infrastructure/queue/upload-queue'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function getUploadStatus(request: FastifyRequest, reply: FastifyReply) {

  const paramsSchema = z.object({
    jobId: z.string(),
  })

  const { jobId } = paramsSchema.parse(request.params)

  const job = await uploadQueue.getJob(jobId)

  if (!job) {
      return reply.status(404).send({ message: 'Job not found' })
  }

  const state = await job.getState()

  return reply.status(200).send({
    jobId: job.id,
    status: state,
    url: state === 'completed' ? job.returnvalue?.url : null,
  })
}
