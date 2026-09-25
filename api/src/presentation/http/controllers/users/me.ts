import { makeGetUserByIdUseCase } from '@/factories/make-get-user-by-id-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const result = await makeGetUserByIdUseCase().execute({ userId })

  if (result.isFailure) {
    return reply.status(404).send({ message: result.error })
  }

  const user = result.value

  return reply.status(200).send({
    id: user.id.value,
    username: user.username.value,
    email: user.email.value,
    avatarUrl: user.avatarUrl,
  })
}
