import type { CharacterId, BookId } from './types.js';
import type { FanMeterResult } from './fan-meter.js';

export interface UserDTO {
  id: string;
  /** Unique login handle (case-insensitive). */
  username: string;
  customName: string | null;
  chosenCharacter: CharacterId;
  displayName: string;
  /** Absolute URL of the user's uploaded avatar, or null if none. */
  avatarUrl: string | null;
  createdAt: string;
}

export interface BookProgressDTO {
  bookId: BookId;
  isRead: boolean;
  updatedAt: string | null;
}

/** POST /api/auth/register — create a new account. */
export interface RegisterRequest {
  username: string;
  password: string;
  chosenCharacter: CharacterId;
  customName?: string | null;
}

/** POST /api/auth/login — authenticate an existing account. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Returned by both register and login. */
export interface AuthResponse {
  token: string;
  user: UserDTO;
}

/** @deprecated Kept for back-compat; identical to {@link AuthResponse}. */
export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

export interface MeResponse {
  user: UserDTO;
  progress: BookProgressDTO[];
  fanMeter: FanMeterResult;
}

export interface UpdateProgressRequest {
  isRead: boolean;
}

export interface UpdateProfileRequest {
  customName: string | null;
}

/** PATCH /api/me/password — change the signed-in user's password. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** DELETE /api/me — permanently delete the signed-in user's account. */
export interface DeleteAccountRequest {
  currentPassword: string;
}

export interface ProgressResponse {
  progress: BookProgressDTO[];
  fanMeter: FanMeterResult;
}

export interface ProfileResponse {
  user: UserDTO;
  fanMeter: FanMeterResult;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
