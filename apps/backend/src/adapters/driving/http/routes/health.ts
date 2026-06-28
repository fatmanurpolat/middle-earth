import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { Clock } from '../../../../ports/driven/Clock.js';

export interface HealthRouteDeps {
  clock: Clock;
}

/**
 * GET /health -> { status: "ok", time: ISOstring }
 */
export function healthRoutes(deps: HealthRouteDeps): FastifyPluginAsync {
  return async (app: FastifyInstance): Promise<void> => {
    app.get('/health', async () => ({
      status: 'ok' as const,
      time: deps.clock.now().toISOString(),
    }));
  };
}
