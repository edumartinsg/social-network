import { env } from '@/env'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import { ZodError } from 'zod'
import { fileRoutes } from './controllers/files/routes'
import { healthRoutes } from './controllers/health/routes'
import { postRoutes } from './controllers/posts/routes'
import { userRoutes } from './controllers/users/routes'


const loggerInstance = require('pino')();

export const app = fastify({
  loggerInstance,
  requestIdLogLabel: 'correlationId', // renames Fastify's default 'reqId' field
  genReqId: () => crypto.randomUUID(), // full UUID instead of Fastify's short counter
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCookie)

app.register(fastifyMultipart, {
  limits: { fileSize: 100 * 1024 * 1024 }
})
app.register(fastifyRateLimit, {
  max: env.NODE_ENV === 'test' ? 1000 : 10,
  timeWindow: '1 minute',
})


app.register(fileRoutes, { prefix: '/files' })
app.register(userRoutes, { prefix: '/users' })
app.register(postRoutes, { prefix: '/posts' })
app.register(healthRoutes, { prefix: '/health' })

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ message: 'Credential could not be verified', issues: error.format() })
  }

  // request.log is Fastify's logger, already scoped to THIS request's correlationId --
  // this is the mechanism that makes the ID actually useful, not just present
  request.log.error({ err: error }, 'Unhandled error')

  return reply.status(500).send({ message: 'Internal server error.' })
})
