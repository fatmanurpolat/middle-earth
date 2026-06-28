import { isBookId, type BookId, type ProgressResponse } from '@middleearth/shared';
import type { BookTrackerUseCase } from '../ports/driving/BookTrackerUseCase.js';
import type { UserRepository } from '../ports/driven/UserRepository.js';
import type { BookProgressRepository } from '../ports/driven/BookProgressRepository.js';
import type { FanMeterService } from '../domain/services/FanMeterService.js';
import {
  NotFoundError,
  ValidationError,
} from '../domain/errors/DomainError.js';
import { mergeProgress } from './mappers.js';

/**
 * Book-tracking use-case implementation. Validates the book id against the
 * shared catalog, upserts read-state, and returns the merged progress + fan
 * meter for the user.
 */
export class BookTrackerService implements BookTrackerUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progress: BookProgressRepository,
    private readonly fanMeter: FanMeterService,
  ) {}

  async listProgress(userId: string): Promise<ProgressResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const entries = await this.progress.listByUser(userId);
    return {
      progress: mergeProgress(entries),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }

  async setRead(
    userId: string,
    bookId: BookId,
    isRead: boolean,
  ): Promise<ProgressResponse> {
    // Defensive: the driving adapter validates too, but the domain owns the rule.
    if (!isBookId(bookId)) {
      throw new ValidationError(`Unknown book id: ${bookId}`);
    }

    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.progress.upsert(userId, bookId, isRead);
    const entries = await this.progress.listByUser(userId);

    return {
      progress: mergeProgress(entries),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }
}
