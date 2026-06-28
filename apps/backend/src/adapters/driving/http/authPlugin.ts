import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import type { ApiErrorBody } from '@middleearth/shared';
import type { TokenService } from '../../../ports/driven/TokenService.js';
import type { SessionRepository } from '../../../ports/driven/SessionRepository.js';
import type { Clock } from '../../../ports/driven/Clock.js';

export interface AuthDeps {
  tokenService: TokenService;
  sessionRepository: SessionRepository;
  clock: Clock;
}

const unauthorizedBody: ApiErrorBody = {
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
  },
};

/** Extract the raw bearer token from the Authorization header, if present. */
function extractBearer(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) {
    return null;
  }
  return value.trim();
}

/**
 * Build a Fastify preHandler that authenticates the request: verify the JWT,
 * confirm a matching non-expired session exists, then set request.userId.
 * On any failure it replies 401 with the shared ApiErrorBody shape.
 */
export function createAuthenticate(deps: AuthDeps): preHandlerHookHandler {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const token = extractBearer(request);
    if (!token) {
      await reply.status(401).send(unauthorizedBody);
      return;
    }

    const payload = deps.tokenService.verify(token);
    if (!payload) {
      await reply.status(401).send(unauthorizedBody);
      return;
    }

    const tokenHash = deps.tokenService.hash(token);
    const session = await deps.sessionRepository.findValid(
      tokenHash,
      deps.clock.now(),
    );
    if (!session || session.userId !== payload.sub) {
      await reply.status(401).send(unauthorizedBody);
      return;
    }

    request.userId = session.userId;
  };
}

/**
 * Read the authenticated user id set by the preHandler. Throws if missing,
 * which indicates a route was registered without the authenticate preHandler.
 */
export function requireUserId(request: FastifyRequest): string {
  const userId = request.userId;
  if (!userId) {
    throw new Error('requireUserId called on an unauthenticated request');
  }
  return userId;
}
