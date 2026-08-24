import { FastifyReply, FastifyRequest } from 'fastify'

// never blocks the request -- if no valid token is present, request.user
// stays undefined and the route continues as anonymous
export async function tryVerifyJwt(request: FastifyRequest, _: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    // swallow, continue unauthenticated
  }
}
