// src/presentation/http/controllers/users/follow.ts
import { makeFollowUserUseCase } from '@/factories/make-follow-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function followUser(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ userId: z.string().min(1) })
  const { userId } = paramsSchema.parse(request.params)

  const followerId = request.user.sub

  const result = await makeFollowUserUseCase().execute({
    followerId,
    followingId: userId,
  })

  if (result.isFailure) {
    return reply.status(400).send({ message: result.error })
  }

  return reply.status(201).send()
}
