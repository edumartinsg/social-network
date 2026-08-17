import { env } from '@/env'
import { prisma } from '@/infraestructure/database/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'
import Redis from 'ioredis'

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000, // fail fast after 2 seconds instead of retrying for 36
})

export async function healthCheck(request: FastifyRequest, reply: FastifyReply) {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
  }

  const isHealthy = Object.values(checks).every((check) => check === true)

  return reply.status(isHealthy ? 200 : 503).send({
    status: isHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
}

async function checkDatabase(): Promise<boolean> {
  try {
  // Perform a simple query to check if the database is reachable
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}
