import { z } from 'zod';

/**
 * Environment configuration for the backend service.
 *
 * Validated once at startup (composition root). Any invalid/missing value
 * aborts the process with a readable message instead of failing later at
 * runtime in some obscure adapter.
 */

const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,http://localhost:5174';

const csvToStringArray = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  CORS_ORIGINS: z
    .string()
    .default(DEFAULT_CORS_ORIGINS)
    .transform(csvToStringArray)
    .pipe(z.array(z.string().min(1)).min(1)),
  // Public base URL of this API, used to build absolute avatar URLs.
  PUBLIC_API_URL: z.string().min(1).default('http://localhost:3000/api'),
  // ── MinIO / object storage ──
  MINIO_ENDPOINT: z.string().min(1).default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().max(65535).default(9000),
  // z.coerce.boolean treats any non-empty string as true, so parse explicitly.
  MINIO_USE_SSL: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  MINIO_ACCESS_KEY: z.string().min(1).default('middleearth'),
  MINIO_SECRET_KEY: z.string().min(1).default('middleearth-minio-secret'),
  MINIO_BUCKET: z.string().min(1).default('avatars'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate process.env. Throws a descriptive Error on failure so the
 * composition root can fail fast.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}
