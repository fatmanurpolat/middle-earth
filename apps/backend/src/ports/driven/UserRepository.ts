import type { CharacterId } from '@middleearth/shared';
import type { User } from '../../domain/entities/User.js';

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  chosenCharacter: CharacterId;
  customName: string | null;
}

/** A user plus the credential needed to authenticate them. */
export interface UserWithCredentials {
  user: User;
  passwordHash: string;
}

/**
 * Driven port for user persistence. Implemented by an infrastructure adapter.
 */
export interface UserRepository {
  /** Persist a new account. Throws ConflictError if the username is taken. */
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  /** Look up an account by username (case-insensitive) for login. */
  findCredentialsByUsername(username: string): Promise<UserWithCredentials | null>;
  /** Look up an account (with its password hash) by id, e.g. for password change. */
  findCredentialsById(id: string): Promise<UserWithCredentials | null>;
  updateCustomName(id: string, customName: string | null): Promise<User>;
  /** Replace the stored password hash for a user. */
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}
