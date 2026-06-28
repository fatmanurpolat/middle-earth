import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { BOOKS, CHARACTERS } from '@middleearth/shared';

/**
 * Static catalog endpoints sourced directly from the shared package:
 *   GET /characters -> Character[]
 *   GET /books      -> Book[]
 */
export function catalogRoutes(): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.get('/characters', async () => CHARACTERS);
    app.get('/books', async () => BOOKS);
  };
}
