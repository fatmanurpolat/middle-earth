import type { Pool } from 'pg';
import { BOOK_IDS, isBookId, type BookId } from '@middleearth/shared';
import { BookProgressEntry } from '../../../domain/entities/BookProgressEntry.js';
import type { BookProgressRepository } from '../../../ports/driven/BookProgressRepository.js';

interface BookProgressRow {
  book_id: string;
  is_read: boolean;
  updated_at: Date;
}

/**
 * PostgreSQL-backed BookProgressRepository.
 */
export class PostgresBookProgressRepository
  implements BookProgressRepository
{
  constructor(private readonly pool: Pool) {}

  async listByUser(userId: string): Promise<BookProgressEntry[]> {
    const result = await this.pool.query<BookProgressRow>(
      `SELECT book_id, is_read, updated_at
       FROM book_progress
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows
      // Ignore any stored book ids that are not part of the current catalog.
      .filter((row): row is BookProgressRow => isBookId(row.book_id))
      .map((row) => this.toEntity(row))
      .sort((a, b) => BOOK_IDS.indexOf(a.bookId) - BOOK_IDS.indexOf(b.bookId));
  }

  async upsert(
    userId: string,
    bookId: BookId,
    isRead: boolean,
  ): Promise<BookProgressEntry> {
    const result = await this.pool.query<BookProgressRow>(
      `INSERT INTO book_progress (user_id, book_id, is_read, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET is_read = EXCLUDED.is_read, updated_at = now()
       RETURNING book_id, is_read, updated_at`,
      [userId, bookId, isRead],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('Failed to upsert book progress: no row returned');
    }
    return this.toEntity(row);
  }

  private toEntity(row: BookProgressRow): BookProgressEntry {
    if (!isBookId(row.book_id)) {
      throw new Error(`Persisted book_id is not a valid BookId: ${row.book_id}`);
    }
    return new BookProgressEntry(
      row.book_id,
      row.is_read,
      new Date(row.updated_at),
    );
  }
}
