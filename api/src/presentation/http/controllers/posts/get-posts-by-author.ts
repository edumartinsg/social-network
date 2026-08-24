import { makeGetPostsByAuthorUseCase } from '@/factories/make-get-posts-by-author-use-case'
import { toFeedPostView } from '@/presentation/http/read-models/feed-post-view'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const paramsSchema = z.object({
  username: z.string().min(1),
})

export async function getPostsByAuthor(request: FastifyRequest, reply: FastifyReply) {
  const { username } = paramsSchema.parse(request.params)

  const useCase = makeGetPostsByAuthorUseCase()
  const result = await useCase.execute({ username })

  if (result.isFailure) {
    return reply.status(404).send({ message: result.error })
  }

  const { author, posts } = result.value

  return reply.status(200).send({
    author: { username: author.username.value, avatarUrl: author.avatarUrl },
    posts: posts.map((post) => toFeedPostView(post, author)),
  })
}
