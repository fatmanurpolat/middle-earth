import {
  computeFanMeter,
  TOTAL_BOOKS,
  type FanMeterResult,
} from '@middleearth/shared';
import type { User } from '../entities/User.js';
import type { BookProgressEntry } from '../entities/BookProgressEntry.js';

/**
 * Domain service that derives a user's fan-meter from their profile and book
 * progress. It maps domain state to the shared FanMeterInput and delegates the
 * deterministic scoring to the shared `computeFanMeter` so backend and frontend
 * stay byte-for-byte identical. No reimplementation of the algorithm here.
 */
export class FanMeterService {
  compute(user: User, progress: readonly BookProgressEntry[]): FanMeterResult {
    const booksRead = progress.filter((entry) => entry.isRead).length;
    const hasCustomName = (user.customName?.trim().length ?? 0) > 0;

    return computeFanMeter({
      booksRead,
      totalBooks: TOTAL_BOOKS,
      // A chosen character always exists for a persisted user.
      hasCharacter: true,
      hasCustomName,
    });
  }
}
