import type { Pool } from 'pg';

/**
 * Idempotent schema touch-ups applied at startup. The base schema is created by
 * db/migrations on first boot; this adds columns introduced later so existing
 * databases (with real data) pick them up without a destructive reset.
 */
export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_key text`,
  );
}
