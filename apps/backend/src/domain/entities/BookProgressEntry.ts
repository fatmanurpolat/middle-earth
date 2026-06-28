import type { BookId } from '@middleearth/shared';

/**
 * A single book's read-state for a user. Pure domain entity.
 */
export class BookProgressEntry {
  constructor(
    public readonly bookId: BookId,
    public readonly isRead: boolean,
    public readonly updatedAt: Date | null,
  ) {}
}
