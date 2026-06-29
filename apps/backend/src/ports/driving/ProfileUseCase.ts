import type { MeResponse, ProfileResponse } from '@middleearth/shared';

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
}
