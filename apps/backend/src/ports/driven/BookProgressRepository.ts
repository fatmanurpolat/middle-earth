import type { BookId } from '@middleearth/shared';
import type { BookProgressEntry } from '../../domain/entities/BookProgressEntry.js';

/**
 * Driven port for book-progress persistence.
 */
export interface BookProgressRepository {
  listByUser(userId: string): Promise<BookProgressEntry[]>;
  upsert(
    userId: string,
    bookId: BookId,
    isRead: boolean,
  ): Promise<BookProgressEntry>;
}
