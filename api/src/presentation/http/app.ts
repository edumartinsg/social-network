import { env } from '@/env'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'
import { ZodError } from 'zod'
import { postRoutes } from './controllers/posts/routes'
import { userRoutes } from './controllers/users/routes'

export const app = fastify({ logger: true })

console.log('Connected to database:', env.DATABASE_URL)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCookie)

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
