// presentation/http/controllers/posts/search-posts.ts
import { makeSearchPostsUseCase } from '@/factories/make-search-posts-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function searchPosts(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    query: z.string().min(1),
    limit: z.coerce.number().optional(),
  })
  const { query, limit } = querySchema.parse(request.query)

  const results = await makeSearchPostsUseCase().execute({ query, limit })
  return reply.status(200).send({ results })
}
