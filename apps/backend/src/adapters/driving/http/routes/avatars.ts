import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { ProfileUseCase } from '../../../../ports/driving/ProfileUseCase.js';

export interface AvatarRouteDeps {
  profileUseCase: ProfileUseCase;
}

/**
 * Public avatar endpoint:
 *   GET /avatars/:userId -> streams the user's avatar image, or 404.
 * Avatars are not sensitive and are embedded via <img>, so this is unauthenticated.
 * The image is proxied through the API, so MinIO stays on the internal network.
 */
export function avatarRoutes(deps: AvatarRouteDeps): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.get('/avatars/:userId', async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const object = await deps.profileUseCase.getAvatar(userId);
      if (!object) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'No avatar' },
        });
      }
      return reply
        .header('Content-Type', object.contentType)
        .header('Cache-Control', 'public, max-age=86400')
        .send(object.body);
    });
  };
}
