import { makeGetPostsByAuthorUseCase } from '@/factories/make-get-posts-by-author-use-case'
import { PrismaFollowRepository } from '@/infrastructure/database/prisma-follow-repository'
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

  const viewerId = request.user?.sub ?? null

  const isFollowing =
    viewerId && viewerId !== author.id.value
      ? await new PrismaFollowRepository().exists(viewerId, author.id.value)
      : false

  return reply.status(200).send({
    author: {
      id: author.id.value,
      username: author.username.value,
      avatarUrl: author.avatarUrl,
    },
    isFollowing,
    isOwnProfile: viewerId === author.id.value,
    posts: posts.map((post) => toFeedPostView(post, author)),
  })
}
