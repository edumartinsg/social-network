import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeAuthenticateUseCase } from '@/factories/make-authenticate-user-use-case'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authenticateBodySchema = z.object({
    email: z.email(),
    password: z.string().min(8),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  const authenticateUserUseCase = makeAuthenticateUseCase()

  const result = await authenticateUserUseCase.execute({
    email,
    password,
  })

  // authentication failure is 401, not 400 -- the request was well-formed but rejected
  if (result.isFailure) {
    return reply.status(401).send({ message: result.error })
  }

  const user = result.value

  // sign a JWT with the user id as the standard 'sub' claim
  const token = await reply.jwtSign(
    {},
    { sign: { sub: user.id.value, expiresIn: '1d' } }
  )

  const refreshToken = await reply.jwtSign(
    {},
    { sign: { sub: user.id.value, expiresIn: '1d' } }
  )

  return reply
    .setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      token,
    })
}
