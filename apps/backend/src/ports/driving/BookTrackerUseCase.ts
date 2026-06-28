import type { BookId, ProgressResponse } from '@middleearth/shared';

/**
 * Driving port for book-tracking use cases.
 */
export interface BookTrackerUseCase {
  listProgress(userId: string): Promise<ProgressResponse>;
  setRead(userId: string, bookId: BookId, isRead: boolean): Promise<ProgressResponse>;
}
