import { env } from '@/env'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import { ZodError } from 'zod'
import { fileRoutes } from './controllers/files/routes'
import { postRoutes } from './controllers/posts/routes'
import { userRoutes } from './controllers/users/routes'


const loggerInstance = require('pino')();
export const app = fastify({ loggerInstance })

console.log('Connected to database:', env.DATABASE_URL)

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

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {

    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
