import type { MeResponse, ProfileResponse } from '@middleearth/shared';
import type { ProfileUseCase } from '../ports/driving/ProfileUseCase.js';
import type { UserRepository } from '../ports/driven/UserRepository.js';
import type { BookProgressRepository } from '../ports/driven/BookProgressRepository.js';
import type { FanMeterService } from '../domain/services/FanMeterService.js';
import { NotFoundError } from '../domain/errors/DomainError.js';
import { mergeProgress, toUserDTO } from './mappers.js';

/**
 * Profile use-case implementation. Reads/writes the user and composes the
 * merged progress + fan meter for the `/api/me` family of endpoints.
 */
export class ProfileService implements ProfileUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progress: BookProgressRepository,
    private readonly fanMeter: FanMeterService,
  ) {}

  async getProfile(userId: string): Promise<MeResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const entries = await this.progress.listByUser(userId);

    return {
      user: toUserDTO(user),
      progress: mergeProgress(entries),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }

  async updateName(
    userId: string,
    customName: string | null,
  ): Promise<ProfileResponse> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const normalized = normalizeCustomName(customName);
    const user = await this.users.updateCustomName(userId, normalized);
    const entries = await this.progress.listByUser(userId);

    return {
      user: toUserDTO(user),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }
}

function normalizeCustomName(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
