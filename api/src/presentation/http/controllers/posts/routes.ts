import { createPost } from "./create-post"
import { FastifyInstance } from "fastify"
import { verifyJwt } from "../../middlewares/verify-jwt"

export async function postRoutes(app: FastifyInstance) {

  /** Authenticated */
  app.post("/", { onRequest: [verifyJwt] }, createPost)
}
