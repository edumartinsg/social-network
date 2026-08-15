import { makeCreateUserUseCase } from '@/factories/make-create-user-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().min(8),
    age: z.number(),
  })

  const { username, email, password, age } = registerBodySchema.parse(request.body)

  const registerUseCase = makeCreateUserUseCase()

  const result = await registerUseCase.execute({
    username,
    email,
    password,
    age,
  })

  if (result.isFailure) {
    return reply.status(400).send({ message: result.error })
  }

  const user = result.value

  return reply.status(201).send({
    id: user.id.value,
    email: user.email.value,
    username: user.username.value,
  })
}
