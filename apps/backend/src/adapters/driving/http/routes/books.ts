import type {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler,
} from 'fastify';
import type { BookTrackerUseCase } from '../../../../ports/driving/BookTrackerUseCase.js';
import { requireUserId } from '../authPlugin.js';
import { bookIdParamSchema, updateProgressBodySchema } from '../schemas.js';

export interface BookRouteDeps {
  bookTrackerUseCase: BookTrackerUseCase;
  authenticate: preHandlerHookHandler;
}

/**
 * Book-progress endpoints (all authenticated):
 *   GET /books/progress             -> ProgressResponse
 *   PUT /books/:bookId/progress     -> ProgressResponse
 */
export function bookRoutes(deps: BookRouteDeps): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.get(
      '/books/progress',
      { preHandler: deps.authenticate },
      async (request) => {
        const userId = requireUserId(request);
        return deps.bookTrackerUseCase.listProgress(userId);
      },
    );

    app.put(
      '/books/:bookId/progress',
      { preHandler: deps.authenticate },
      async (request) => {
        const userId = requireUserId(request);
        const { bookId } = bookIdParamSchema.parse(request.params);
        const { isRead } = updateProgressBodySchema.parse(request.body);
        return deps.bookTrackerUseCase.setRead(userId, bookId, isRead);
      },
    );
  };
}
