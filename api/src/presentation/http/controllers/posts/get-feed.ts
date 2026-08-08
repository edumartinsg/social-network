import { makeGetFeedUseCase } from '@/factories/make-get-feed-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function getFeed(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    cursor: z.string().optional(),
  })

  const { cursor } = querySchema.parse(request.query)

  const isAuthenticated = !!request.user
  const userId = request.user?.sub

  const getFeedUseCase = makeGetFeedUseCase()

  const { posts, nextCursor } = await getFeedUseCase.execute({
    userId,
    cursor,
    isAuthenticated,
  })

  return reply.status(200).send({
    posts: posts.map(post => ({
      id: post.postId,
      title: post.title.value,
      mediaType: post.mediaType.value,
      authorId: post.authorId,
      createdAt: post.createdAt,
    })),
    nextCursor,
  })
}
