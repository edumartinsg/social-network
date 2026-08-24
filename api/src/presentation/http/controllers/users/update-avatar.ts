import { makeUpdateUserAvatarUseCase } from '@/factories/make-update-user-avatar-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function updateAvatar(request: FastifyRequest, reply: FastifyReply) {
  // Same rule as create-post's authorId (ADR-008): the user being updated
  // is always the authenticated caller, read from the verified token, never
  // from a route param or body value. There is no route where user A can
  // change user B's avatar.
  const userId = request.user.sub

  const uploadedFile = await request.file()
  if (!uploadedFile) {
    return reply.status(400).send({ message: 'No file provided' })
  }

  const buffer = await uploadedFile.toBuffer()

  const useCase = makeUpdateUserAvatarUseCase()
  const result = await useCase.execute({
    userId,
    file: buffer,
    mimeType: uploadedFile.mimetype,
  })

  if (result.isFailure) {
    return reply.status(400).send({ message: result.error })
  }

  return reply.status(200).send({ avatarUrl: result.value.avatarUrl })
}
