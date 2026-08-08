import { authenticate } from "./authenticate"
// import { profile } from "./profile"
import { FastifyInstance } from "fastify"
import { register } from "./register"


import { verifyJwt } from "../../middlewares/verify-jwt"
import { followUser } from "./follow"
import { unfollowUser } from "./unfollow"

export async function userRoutes(app: FastifyInstance) {
  app.post("/register", register)
  app.post("/authenticate", authenticate)
  app.post("/:userId/follow", { onRequest: [verifyJwt] }, followUser)
  app.delete("/:userId/follow", { onRequest: [verifyJwt] }, unfollowUser)

  //   app.patch("/token/refresh", refresh)

  /** Authenticated */
  //   app.get("/me", { onRequest: [verifyJwt] }, profile)
}
