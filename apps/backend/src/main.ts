import { loadEnvFiles } from './config/loadEnvFiles.js';
import { loadEnv } from './config/env.js';
import { createPool } from './adapters/driven/postgres/pool.js';
import { ensureSchema } from './adapters/driven/postgres/ensureSchema.js';
import { MinioObjectStorage } from './adapters/driven/storage/MinioObjectStorage.js';
import { PostgresUserRepository } from './adapters/driven/postgres/PostgresUserRepository.js';
import { PostgresBookProgressRepository } from './adapters/driven/postgres/PostgresBookProgressRepository.js';
import { PostgresSessionRepository } from './adapters/driven/postgres/PostgresSessionRepository.js';
import { JwtTokenService } from './adapters/driven/security/JwtTokenService.js';
import { BcryptPasswordHasher } from './adapters/driven/security/BcryptPasswordHasher.js';
import { SystemClock } from './adapters/driven/system/SystemClock.js';
import { FanMeterService } from './domain/services/FanMeterService.js';
import { AuthService } from './application/AuthService.js';
import { ProfileService } from './application/ProfileService.js';
import { BookTrackerService } from './application/BookTrackerService.js';
import { buildServer } from './adapters/driving/http/server.js';

/**
 * Composition root. Loads config, constructs all driven adapters, injects them
 * into the application services, builds the HTTP server and starts listening.
 * Handles graceful shutdown of the server and the database pool.
 */
async function bootstrap(): Promise<void> {
  loadEnvFiles();
  const env = loadEnv();

  // ---- Driven adapters (infrastructure) ----
  const pool = createPool(env.DATABASE_URL);
  // Apply idempotent schema touch-ups (e.g. the avatar_key column) so existing
  // databases pick up later columns without a destructive reset.
  await ensureSchema(pool);

  const objectStorage = new MinioObjectStorage({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    bucket: env.MINIO_BUCKET,
  });

  const userRepository = new PostgresUserRepository(pool);
  const bookProgressRepository = new PostgresBookProgressRepository(pool);
  const sessionRepository = new PostgresSessionRepository(pool);
  const tokenService = new JwtTokenService({
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  });
  const clock = new SystemClock();
  const passwordHasher = new BcryptPasswordHasher();

  // ---- Domain services ----
  const fanMeterService = new FanMeterService();

  // ---- Application use cases ----
  const authUseCase = new AuthService(
    userRepository,
    sessionRepository,
    tokenService,
    passwordHasher,
    env.PUBLIC_API_URL,
  );
  const profileUseCase = new ProfileService(
    userRepository,
    bookProgressRepository,
    fanMeterService,
    passwordHasher,
    objectStorage,
    env.PUBLIC_API_URL,
  );
  const bookTrackerUseCase = new BookTrackerService(
    userRepository,
    bookProgressRepository,
    fanMeterService,
  );

  // Ensure the storage bucket exists (best-effort — the rest of the API still
  // works if MinIO is briefly unavailable; only avatar uploads would fail).
  try {
    await objectStorage.ensureBucket();
  } catch (error) {
    console.warn('Could not ensure MinIO bucket; avatars may be unavailable.', error);
  }

  // ---- Driving adapter (HTTP) ----
  const server = await buildServer({
    authUseCase,
    profileUseCase,
    bookTrackerUseCase,
    tokenService,
    sessionRepository,
    clock,
    corsOrigins: env.CORS_ORIGINS,
  });

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    server.log.info({ signal }, 'Shutting down');
    try {
      await server.close();
      await pool.end();
      process.exit(0);
    } catch (error) {
      server.log.error(error, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await server.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    server.log.error(error, 'Failed to start server');
    await pool.end();
    process.exit(1);
  }
}

void bootstrap();
