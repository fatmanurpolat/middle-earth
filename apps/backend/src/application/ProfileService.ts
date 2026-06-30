import { randomUUID } from 'node:crypto';
import type { MeResponse, ProfileResponse } from '@middleearth/shared';
import type {
  AvatarUpload,
  ProfileUseCase,
} from '../ports/driving/ProfileUseCase.js';
import type { UserRepository } from '../ports/driven/UserRepository.js';
import type { BookProgressRepository } from '../ports/driven/BookProgressRepository.js';
import type { PasswordHasher } from '../ports/driven/PasswordHasher.js';
import type {
  ObjectStorage,
  StoredObject,
} from '../ports/driven/ObjectStorage.js';
import type { FanMeterService } from '../domain/services/FanMeterService.js';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../domain/errors/DomainError.js';
import { mergeProgress, toUserDTO } from './mappers.js';

const AVATAR_EXT: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Profile use-case implementation. Reads/writes the user and composes the
 * merged progress + fan meter for the `/api/me` family of endpoints.
 */
export class ProfileService implements ProfileUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progress: BookProgressRepository,
    private readonly fanMeter: FanMeterService,
    private readonly passwords: PasswordHasher,
    private readonly storage: ObjectStorage,
    private readonly publicApiUrl: string,
  ) {}

  async getProfile(userId: string): Promise<MeResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const entries = await this.progress.listByUser(userId);

    return {
      user: toUserDTO(user, this.publicApiUrl),
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
      user: toUserDTO(user, this.publicApiUrl),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const credentials = await this.users.findCredentialsById(userId);
    if (!credentials) {
      throw new NotFoundError('User not found');
    }

    const ok = await this.passwords.verify(
      currentPassword,
      credentials.passwordHash,
    );
    if (!ok) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await this.passwords.hash(newPassword);
    await this.users.updatePasswordHash(userId, newHash);
  }

  async deleteAccount(userId: string, currentPassword: string): Promise<void> {
    const credentials = await this.users.findCredentialsById(userId);
    if (!credentials) {
      throw new NotFoundError('User not found');
    }

    const ok = await this.passwords.verify(
      currentPassword,
      credentials.passwordHash,
    );
    if (!ok) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Best-effort avatar cleanup; sessions and progress cascade in the DB.
    if (credentials.user.avatarKey) {
      try {
        await this.storage.delete(credentials.user.avatarKey);
      } catch {
        /* ignore — orphaned object is harmless */
      }
    }

    await this.users.delete(userId);
  }

  async setAvatar(
    userId: string,
    upload: AvatarUpload,
  ): Promise<ProfileResponse> {
    const ext = AVATAR_EXT[upload.contentType];
    if (!ext) {
      throw new ValidationError('Unsupported image type. Use JPEG, PNG or WebP.');
    }

    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const key = `avatars/${userId}/${randomUUID()}.${ext}`;
    await this.storage.put(key, upload.body, upload.contentType);

    const user = await this.users.updateAvatarKey(userId, key);

    // Best-effort cleanup of the previous avatar object.
    if (existing.avatarKey && existing.avatarKey !== key) {
      try {
        await this.storage.delete(existing.avatarKey);
      } catch {
        /* ignore — orphaned object is harmless */
      }
    }

    const entries = await this.progress.listByUser(userId);
    return {
      user: toUserDTO(user, this.publicApiUrl),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }

  async removeAvatar(userId: string): Promise<ProfileResponse> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    if (existing.avatarKey) {
      try {
        await this.storage.delete(existing.avatarKey);
      } catch {
        /* ignore — orphaned object is harmless */
      }
    }

    const user = await this.users.updateAvatarKey(userId, null);
    const entries = await this.progress.listByUser(userId);
    return {
      user: toUserDTO(user, this.publicApiUrl),
      fanMeter: this.fanMeter.compute(user, entries),
    };
  }

  async getAvatar(userId: string): Promise<StoredObject | null> {
    const user = await this.users.findById(userId);
    if (!user || !user.avatarKey) {
      return null;
    }
    return this.storage.get(user.avatarKey);
  }
}

function normalizeCustomName(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
