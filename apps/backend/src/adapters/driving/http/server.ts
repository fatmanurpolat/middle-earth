import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@middleearth/shared';
import { DomainError } from '../../../domain/errors/DomainError.js';
import type { AuthUseCase } from '../../../ports/driving/AuthUseCase.js';
import type { ProfileUseCase } from '../../../ports/driving/ProfileUseCase.js';
import type { BookTrackerUseCase } from '../../../ports/driving/BookTrackerUseCase.js';
import type { TokenService } from '../../../ports/driven/TokenService.js';
import type { SessionRepository } from '../../../ports/driven/SessionRepository.js';
import type { Clock } from '../../../ports/driven/Clock.js';
import { createAuthenticate } from './authPlugin.js';
import { healthRoutes } from './routes/health.js';
import { catalogRoutes } from './routes/catalog.js';
import { authRoutes } from './routes/auth.js';
import { meRoutes } from './routes/me.js';
import { bookRoutes } from './routes/books.js';

export interface ServerDeps {
  authUseCase: AuthUseCase;
  profileUseCase: ProfileUseCase;
  bookTrackerUseCase: BookTrackerUseCase;
  tokenService: TokenService;
  sessionRepository: SessionRepository;
  clock: Clock;
  corsOrigins: string[];
}

/**
 * Compose the Fastify application: CORS, a global error handler that maps domain
 * and validation errors to the shared ApiErrorBody, and every route plugin
 * mounted under the /api prefix.
 */
export async function buildServer(deps: ServerDeps): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    // Trust the configured origins; reject unknown ones below.
  });

  await app.register(cors, {
    origin: deps.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setErrorHandler((error, request, reply) => {
    // Domain errors carry their own code + HTTP status.
    if (error instanceof DomainError) {
      const body: ApiErrorBody = {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      };
      return reply.status(error.status).send(body);
    }

    // Zod validation failures -> 400 VALIDATION_ERROR.
    if (error instanceof ZodError) {
      const body: ApiErrorBody = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues,
        },
      };
      return reply.status(400).send(body);
    }

    // Fastify's own validation (statusCode 400) -> VALIDATION_ERROR.
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
    if (statusCode >= 400 && statusCode < 500) {
      const body: ApiErrorBody = {
        error: {
          code: 'BAD_REQUEST',
          message: error.message,
        },
      };
      return reply.status(statusCode).send(body);
    }

    // Anything else is an unexpected server fault.
    request.log.error(error);
    const body: ApiErrorBody = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
    return reply.status(500).send(body);
  });

  app.setNotFoundHandler((_request, reply) => {
    const body: ApiErrorBody = {
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    };
    return reply.status(404).send(body);
  });

  const authenticate = createAuthenticate({
    tokenService: deps.tokenService,
    sessionRepository: deps.sessionRepository,
    clock: deps.clock,
  });

  // All endpoints live under /api.
  await app.register(
    async (api) => {
      await api.register(healthRoutes({ clock: deps.clock }));
      await api.register(catalogRoutes());
      await api.register(
        authRoutes({
          authUseCase: deps.authUseCase,
          tokenService: deps.tokenService,
          authenticate,
        }),
      );
      await api.register(
        meRoutes({ profileUseCase: deps.profileUseCase, authenticate }),
      );
      await api.register(
        bookRoutes({
          bookTrackerUseCase: deps.bookTrackerUseCase,
          authenticate,
        }),
      );
    },
    { prefix: '/api' },
  );

  return app;
}
