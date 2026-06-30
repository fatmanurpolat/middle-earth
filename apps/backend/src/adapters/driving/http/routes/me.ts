import type {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler,
} from 'fastify';
import type { ProfileUseCase } from '../../../../ports/driving/ProfileUseCase.js';
import { requireUserId } from '../authPlugin.js';
import {
  changePasswordBodySchema,
  deleteAccountBodySchema,
  updateProfileBodySchema,
} from '../schemas.js';
import { ValidationError } from '../../../../domain/errors/DomainError.js';

export interface MeRouteDeps {
  profileUseCase: ProfileUseCase;
  authenticate: preHandlerHookHandler;
}

/**
 * Current-user endpoints (all authenticated):
 *   GET    /me          -> MeResponse
 *   PATCH  /me          -> ProfileResponse
 *   PATCH  /me/password -> 204 (change password)
 *   POST   /me/avatar   -> ProfileResponse (upload avatar)
 *   DELETE /me/avatar   -> ProfileResponse (remove avatar)
 *   DELETE /me          -> 204 (delete account)
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

    // Multipart avatar upload (field name "file").
    app.post(
      '/me/avatar',
      { preHandler: deps.authenticate },
      async (request, reply) => {
        const userId = requireUserId(request);
        const data = await request.file();
        if (!data) {
          throw new ValidationError('No image file was uploaded.');
        }
        const body = await data.toBuffer();
        const result = await deps.profileUseCase.setAvatar(userId, {
          body,
          contentType: data.mimetype,
        });
        return reply.send(result);
      },
    );

    app.delete(
      '/me/avatar',
      { preHandler: deps.authenticate },
      async (request) => {
        const userId = requireUserId(request);
        return deps.profileUseCase.removeAvatar(userId);
      },
    );

    app.delete(
      '/me',
      { preHandler: deps.authenticate },
      async (request, reply) => {
        const userId = requireUserId(request);
        const body = deleteAccountBodySchema.parse(request.body);
        await deps.profileUseCase.deleteAccount(userId, body.currentPassword);
        return reply.status(204).send();
      },
    );
  };
}
