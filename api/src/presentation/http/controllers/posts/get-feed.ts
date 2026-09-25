import { makeGetFeedUseCase } from '@/factories/make-get-feed-use-case'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'
import { FeedPostView, toFeedPostView } from '@/presentation/http/read-models/feed-post-view'
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

  // scope this feed UI to images and videos only, per the brief --
  // filtering happens here, before mapping, so toFeedPostView never
  // has to decide what an article-only post reduces to
  const mediaPosts = posts.filter(
    (post) => post.mediaType.value === 'image' || post.mediaType.value === 'video'
  )

  // batch-fetch authors once, by the distinct set of ids in this page --
  // avoids an N+1 query (one findById call per post in a loop)
  const authorIds = [...new Set(mediaPosts.map((post) => post.authorId))]
  const userRepository = new PrismaUserRepository()
  const authors = await userRepository.findManyByIds(authorIds)
  const authorsById = new Map(authors.map((author) => [author.id.value, author]))

  const postViews: FeedPostView[] = mediaPosts
    .map((post) => {
      const author = authorsById.get(post.authorId)
      return author ? toFeedPostView(post, author) : null
    })
    .filter((view): view is FeedPostView => view !== null)

  return reply.status(200).send({
    posts: postViews,
    nextCursor,
  })
}
