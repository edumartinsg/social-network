import { FastifyInstance } from "fastify"
import { verifyJwt } from "../../middlewares/verify-jwt"
import { getUploadStatus } from "./get-upload-status"
import { uploadFile } from "./upload"

export async function fileRoutes(app: FastifyInstance) {
  app.post("/upload", { onRequest: [verifyJwt] }, uploadFile)
  app.get("/upload/:jobId/status",{onRequest:[verifyJwt]},getUploadStatus)
}
