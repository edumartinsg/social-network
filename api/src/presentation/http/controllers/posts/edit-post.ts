import { makeEditPostUseCase } from '@/factories/make-edit-post-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function editPost(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().min(1),
  })

  const editPostBodySchema = z.object({
    body: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    videoUrl: z.string().optional(),
    videoDurationSeconds: z.number().int().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const data = editPostBodySchema.parse(request.body)

  const authorId = request.user.sub

  const editPostUseCase = makeEditPostUseCase()

  const result = await editPostUseCase.execute({
    postId: id,
    authorId,
    ...data,
  })

  // EditPostUseCase returns the same message for "not found", "deleted",
  // and "not the author" on purpose. 404 keeps that ambiguity at the HTTP
  // layer too — a 403 would confirm the post exists but belongs to someone
  // else, which is exactly the information the use case is hiding.
  if (result.isFailure) {
    return reply.status(404).send({ message: result.error })
  }

  // 200, not 201 — no new resource was created, an existing one changed.
  return reply.status(200).send()
}
