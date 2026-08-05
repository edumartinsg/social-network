import { authenticate } from "./authenticate"
// import { profile } from "./profile"
import { register } from "./register"
import { FastifyInstance } from "fastify"
import { verifyJwt } from "../../middlewares/verify-jwt"

export async function userRoutes(app: FastifyInstance) {
  app.post("/register", register)
  app.post("/authenticate", authenticate)

  //   app.patch("/token/refresh", refresh)

  /** Authenticated */
  //   app.get("/me", { onRequest: [verifyJwt] }, profile)
}
