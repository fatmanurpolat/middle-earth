import type {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler,
} from 'fastify';
import type { ProfileUseCase } from '../../../../ports/driving/ProfileUseCase.js';
import { requireUserId } from '../authPlugin.js';
import { updateProfileBodySchema } from '../schemas.js';

export interface MeRouteDeps {
  profileUseCase: ProfileUseCase;
  authenticate: preHandlerHookHandler;
}

/**
 * Current-user endpoints (all authenticated):
 *   GET   /me -> MeResponse
 *   PATCH /me -> ProfileResponse
 */
export function meRoutes(deps: MeRouteDeps): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.get('/me', { preHandler: deps.authenticate }, async (request) => {
      const userId = requireUserId(request);
      return deps.profileUseCase.getProfile(userId);
    });

    app.patch('/me', { preHandler: deps.authenticate }, async (request) => {
      const userId = requireUserId(request);
      const body = updateProfileBodySchema.parse(request.body);
      return deps.profileUseCase.updateName(userId, body.customName);
    });
  };
}
