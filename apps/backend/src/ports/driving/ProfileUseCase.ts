import type { MeResponse, ProfileResponse } from '@middleearth/shared';

/**
 * Driving port for profile use cases.
 */
export interface ProfileUseCase {
  getProfile(userId: string): Promise<MeResponse>;
  updateName(userId: string, customName: string | null): Promise<ProfileResponse>;
}
