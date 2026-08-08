import { FastifyInstance } from "fastify"
import { tryVerifyJwt } from "../../middlewares/try-verify-jwt"
import { verifyJwt } from "../../middlewares/verify-jwt"
import { createPost } from "./create-post"
import { deletePost } from "./delete-post"
import { editPost } from "./edit-post"
import { getFeed } from "./get-feed"

export async function postRoutes(app: FastifyInstance) {
  app.post("/", { onRequest: [verifyJwt] }, createPost)
  app.put("/:id", { onRequest: [verifyJwt] }, editPost)
  app.delete("/:id", { onRequest: [verifyJwt] }, deletePost)
  app.get("/feed", { onRequest: [tryVerifyJwt] }, getFeed)
}
