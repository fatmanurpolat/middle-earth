import type { AuthResponse, CharacterId } from '@middleearth/shared';

export interface RegisterCommand {
  username: string;
  password: string;
  chosenCharacter: CharacterId;
  customName: string | null;
}

export interface LoginCommand {
  username: string;
  password: string;
}

/**
 * Driving port for authentication use cases. Called by the HTTP layer.
 */
export interface AuthUseCase {
  /** Create a new account and open a session. */
  register(cmd: RegisterCommand): Promise<AuthResponse>;
  /** Authenticate an existing account and open a session. */
  login(cmd: LoginCommand): Promise<AuthResponse>;
  /** Revoke the session identified by the hash of its token. */
  logout(tokenHash: string): Promise<void>;
}
