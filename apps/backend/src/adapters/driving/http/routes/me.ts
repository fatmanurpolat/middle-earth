import type {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler,
} from 'fastify';
import type { ProfileUseCase } from '../../../../ports/driving/ProfileUseCase.js';
import { requireUserId } from '../authPlugin.js';
import { changePasswordBodySchema, updateProfileBodySchema } from '../schemas.js';

export interface MeRouteDeps {
  profileUseCase: ProfileUseCase;
  authenticate: preHandlerHookHandler;
}

/**
 * Current-user endpoints (all authenticated):
 *   GET   /me          -> MeResponse
 *   PATCH /me          -> ProfileResponse
 *   PATCH /me/password -> 204 (change password)
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

    app.patch(
      '/me/password',
      { preHandler: deps.authenticate },
      async (request, reply) => {
        const userId = requireUserId(request);
        const body = changePasswordBodySchema.parse(request.body);
        await deps.profileUseCase.changePassword(
          userId,
          body.currentPassword,
          body.newPassword,
        );
        return reply.status(204).send();
      },
    );
  };
}
