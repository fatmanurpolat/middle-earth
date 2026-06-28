import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads environment variables from .env files for local development using
 * Node's built-in parser (no dependency). Real process-environment values
 * always take precedence, so this is effectively a no-op in Docker/production
 * where the environment is provided directly.
 *
 * Candidate files (first to claim a given key wins): the backend-local .env,
 * then the monorepo root .env. Both are optional.
 */
export function loadEnvFiles(): void {
  if (typeof process.loadEnvFile !== 'function') {
    return; // older Node without built-in .env support — rely on the real env
  }

  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) {
      continue;
    }
    try {
      process.loadEnvFile(file);
    } catch {
      // Ignore unreadable/partial env files in dev; validation happens later.
    }
  }
}
