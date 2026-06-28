import pg from 'pg';

const { Pool } = pg;

/**
 * Create a PostgreSQL connection pool from a connection string. The pool is a
 * shared infrastructure resource owned by the composition root.
 */
export function createPool(databaseUrl: string): pg.Pool {
  return new Pool({ connectionString: databaseUrl });
}

export type { Pool } from 'pg';
