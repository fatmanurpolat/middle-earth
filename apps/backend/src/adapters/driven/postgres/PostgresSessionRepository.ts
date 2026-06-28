import type { Pool } from 'pg';
import type { SessionRepository } from '../../../ports/driven/SessionRepository.js';

interface SessionUserRow {
  user_id: string;
}

/**
 * PostgreSQL-backed SessionRepository. Token hashes are stored, never the raw
 * token. `findValid` only returns sessions whose expiry is still in the future.
 */
export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly pool: Pool) {}

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt],
    );
  }

  async findValid(
    tokenHash: string,
    now: Date,
  ): Promise<{ userId: string } | null> {
    const result = await this.pool.query<SessionUserRow>(
      `SELECT user_id
       FROM sessions
       WHERE token_hash = $1 AND expires_at > $2`,
      [tokenHash, now],
    );

    const row = result.rows[0];
    return row ? { userId: row.user_id } : null;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.pool.query(`DELETE FROM sessions WHERE token_hash = $1`, [
      tokenHash,
    ]);
  }
}
