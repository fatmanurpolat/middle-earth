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
  /** Remove the user's avatar (the UI falls back to the character portrait). */
  removeAvatar(userId: string): Promise<ProfileResponse>;
  /** Fetch the raw avatar bytes for the public avatar endpoint. */
  getAvatar(userId: string): Promise<StoredObject | null>;
  /**
   * Permanently delete the user's account after verifying their password.
   * Removes the avatar from storage; sessions and progress cascade in the DB.
   * Throws UnauthorizedError if the password does not match.
   */
  deleteAccount(userId: string, currentPassword: string): Promise<void>;
}
