/**
 * Driven port for session persistence. Tokens are stored hashed.
 */
export interface SessionRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  /** Returns the owning user id when a non-expired session exists, else null. */
  findValid(tokenHash: string, now: Date): Promise<{ userId: string } | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
