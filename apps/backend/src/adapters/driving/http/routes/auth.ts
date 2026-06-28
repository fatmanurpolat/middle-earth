import type {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler,
} from 'fastify';
import type { AuthUseCase } from '../../../../ports/driving/AuthUseCase.js';
import type { TokenService } from '../../../../ports/driven/TokenService.js';
import { loginBodySchema, registerBodySchema } from '../schemas.js';

export interface AuthRouteDeps {
  authUseCase: AuthUseCase;
  tokenService: TokenService;
  authenticate: preHandlerHookHandler;
}

/**
 * Authentication endpoints:
 *   POST   /auth/register -> 201 AuthResponse (creates account + session)
 *   POST   /auth/login    -> 200 AuthResponse (authenticates + session)
 *   DELETE /auth/session  -> 204 (revokes the current session)
 */
export function authRoutes(deps: AuthRouteDeps): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.post('/auth/register', async (request, reply) => {
      const body = registerBodySchema.parse(request.body);

      const result = await deps.authUseCase.register({
        username: body.username,
        password: body.password,
        chosenCharacter: body.chosenCharacter,
        customName: body.customName,
      });

      return reply.status(201).send(result);
    });

    app.post('/auth/login', async (request, reply) => {
      const body = loginBodySchema.parse(request.body);

      const result = await deps.authUseCase.login({
        username: body.username,
        password: body.password,
      });

      return reply.status(200).send(result);
    });

    app.delete(
      '/auth/session',
      { preHandler: deps.authenticate },
      async (request, reply) => {
        // The preHandler already validated the bearer; recompute its hash to
        // revoke exactly this session.
        const header = request.headers.authorization ?? '';
        const token = header.split(' ')[1]?.trim() ?? '';
        const tokenHash = deps.tokenService.hash(token);

        await deps.authUseCase.logout(tokenHash);
        return reply.status(204).send();
      },
    );
  };
}
