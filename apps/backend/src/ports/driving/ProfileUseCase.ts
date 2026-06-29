import type { MeResponse, ProfileResponse } from '@middleearth/shared';
import type { StoredObject } from '../driven/ObjectStorage.js';

export interface AvatarUpload {
  body: Buffer;
  contentType: string;
}

/**
 * Driving port for profile use cases.
 */
export interface ProfileUseCase {
  getProfile(userId: string): Promise<MeResponse>;
  updateName(userId: string, customName: string | null): Promise<ProfileResponse>;
  /**
   * Change the user's password. Throws UnauthorizedError if the current
   * password does not match.
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  /** Upload/replace the user's avatar; returns the updated profile. */
  setAvatar(userId: string, upload: AvatarUpload): Promise<ProfileResponse>;
  /** Fetch the raw avatar bytes for the public avatar endpoint. */
  getAvatar(userId: string): Promise<StoredObject | null>;
}
