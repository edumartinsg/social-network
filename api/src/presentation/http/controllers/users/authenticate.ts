import { makeAuthenticateUserUseCase } from '@/factories/make-authenticate-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

// Zod confirms identifier and password exist as non-empty strings. Whether
// identifier reads as an email or a username is a business distinction, not
// a shape one, so it stays out of this schema entirely (ADR-010).
const authenticateBodySchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const { identifier, password } = authenticateBodySchema.parse(request.body)

  const useCase = makeAuthenticateUserUseCase()
  const result = await useCase.execute({ identifier, password })

  if (result.isFailure) {
    // 401, not 400: the request was well-formed, the credentials were
    // rejected. See ARCHITECTURE.md, Request Flow -- Authenticate.
    return reply.status(401).send({ message: result.error })
  }

  const user = result.value
  const token = await reply.jwtSign(
    {},
    { sign: { sub: user.id.value, expiresIn: '1d' } },
  )

  return reply.status(200).send({ token })
}
