import { FastifyInstance } from "fastify"
import { healthCheck } from "./health-check"

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', healthCheck)
}
