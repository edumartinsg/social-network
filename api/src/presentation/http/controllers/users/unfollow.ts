// src/presentation/http/controllers/users/unfollow.ts
import { makeUnfollowUserUseCase } from '@/factories/make-unfollow-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function unfollowUser(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ userId: z.string().min(1) })
  const { userId } = paramsSchema.parse(request.params)

  const followerId = request.user.sub

  const result = await makeUnfollowUserUseCase().execute({
    followerId,
    followingId: userId,
  })

  if (result.isFailure) {
    return reply.status(400).send({ message: result.error })
  }

  return reply.status(204).send()
}
