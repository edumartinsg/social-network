import { makeDeletePostUseCase } from '@/factories/make-delete-post-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function deletePost(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().min(1),
  })

  const { id } = paramsSchema.parse(request.params)

  const requesterId = request.user.sub

  const deletePostUseCase = makeDeletePostUseCase()

  const result = await deletePostUseCase.execute({
    postId: id,
    requesterId,
    // hardcoded false: no role system exists yet, so this route can only
    // ever be the owner deleting their own post. Moderation deletion has
    // no HTTP entry point until roles are built — this is the same known
    // gap already documented in DeletePostUseCase.
    isModerationAction: false,
  })

  if (result.isFailure) {
    return reply.status(404).send({ message: result.error })
  }

  // 204: success, nothing to return.
  return reply.status(204).send()
}
