import { makeSearchUsersUseCase } from '@/factories/make-search-users-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const searchQuerySchema = z.object({
  q: z.string().min(1),
})

// No auth required -- usernames and avatars are public profile data, the
// same reasoning that keeps /posts/search unauthenticated (Challenge 15).
export async function searchUsers(request: FastifyRequest, reply: FastifyReply) {
  const { q } = searchQuerySchema.parse(request.query)

  const useCase = makeSearchUsersUseCase()
  const results = await useCase.execute({ query: q })

  return reply.status(200).send({ results })
}
