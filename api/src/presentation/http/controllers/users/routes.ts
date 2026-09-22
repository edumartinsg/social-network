import { FastifyInstance } from "fastify"
import { tryVerifyJwt } from "../../middlewares/try-verify-jwt"
import { verifyJwt } from "../../middlewares/verify-jwt"
import { getPostsByAuthor } from "../posts/get-posts-by-author"
import { authenticate } from "./authenticate"
import { followUser } from "./follow"
import { me } from "./me"
import { register } from "./register"
import { searchUsers } from "./search"
import { unfollowUser } from "./unfollow"
import { updateAvatar } from "./update-avatar"

export async function userRoutes(app: FastifyInstance) {
  app.post("/register", register)
  app.post("/authenticate", authenticate)



  app.get('/search', searchUsers)
  app.post('/avatar', { onRequest: [verifyJwt] }, updateAvatar)

  app.get('/:username/posts', { onRequest: [tryVerifyJwt] }, getPostsByAuthor)

  app.post("/:userId/follow", { onRequest: [verifyJwt] }, followUser)
  app.delete("/:userId/follow", { onRequest: [verifyJwt] }, unfollowUser)

    app.get('/me', { onRequest: [verifyJwt] }, me)
}
