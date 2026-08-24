import { prisma } from "@/infrastructure/database/lib/prisma"
import { FastifyInstance } from "fastify"

// src/test/helpers/register-and-authenticate.ts
export async function registerAndAuthenticate(app: FastifyInstance, email: string, username: string) {
  await app.inject({ method: 'POST', url: '/users/register', payload: { username, email, password: 'Password123!', age: 25 } })
  const authResponse = await app.inject({ method: 'POST', url: '/users/authenticate', payload: { identifier: email, password: 'Password123!' } })
  const body = authResponse.json()
  const user = await prisma.user.findUnique({ where: { email } })
  return { token: body.token as string, userId: user!.id }
}
