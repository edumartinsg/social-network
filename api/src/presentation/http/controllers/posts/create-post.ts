import { makeCreatePostUseCase } from '@/factories/make-create-post-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function createPost(request: FastifyRequest, reply: FastifyReply) {
  const createPostBodySchema = z.object({
    title: z.string(),
    mediaType: z.enum(['video', 'image', 'article']),
    caption: z.string().optional(),
    body: z.string().optional(),
    coverImageUrls: z.array(z.string()).optional(),
    imageUrls: z.array(z.string()).optional(),
    videoUrl: z.string().optional(),
    videoDurationSeconds: z.int().optional(),
  })

  const data = createPostBodySchema.parse(request.body)

  // authorId comes from the verified JWT, never from the request body
  // this prevents a user from creating posts as someone else (OWASP A01)
  const authorId = request.user.sub

  const createPostUseCase = makeCreatePostUseCase()

  const result = await createPostUseCase.execute({
    authorId,
    ...data,
  })

  if (result.isFailure) {
    return reply.status(400).send({ message: result.error })
  }

  const post = result.value

  return reply.status(201).send({
    id: post.postId,
    title: post.title.value,
    mediaType: post.mediaType.value,
  })

}
