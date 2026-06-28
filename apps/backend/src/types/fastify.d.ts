import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    /** Authenticated user id, set by the auth preHandler on protected routes. */
    userId?: string;
  }
}
