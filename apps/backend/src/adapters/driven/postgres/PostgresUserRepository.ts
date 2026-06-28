import type { Pool } from 'pg';
import { isCharacterId, type CharacterId } from '@middleearth/shared';
import { User } from '../../../domain/entities/User.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/DomainError.js';
import type {
  CreateUserInput,
  UserRepository,
  UserWithCredentials,
} from '../../../ports/driven/UserRepository.js';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  custom_name: string | null;
  chosen_character: string;
  created_at: Date;
}

const USER_COLUMNS =
  'id, username, password_hash, custom_name, chosen_character, created_at';

/**
 * PostgreSQL-backed UserRepository. Parametrized queries only.
 */
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreateUserInput): Promise<User> {
    if (!isCharacterId(input.chosenCharacter)) {
      throw new ValidationError(
        `Unknown character id: ${input.chosenCharacter}`,
      );
    }

    try {
      const result = await this.pool.query<UserRow>(
        `INSERT INTO users (username, password_hash, custom_name, chosen_character)
         VALUES ($1, $2, $3, $4)
         RETURNING ${USER_COLUMNS}`,
        [
          input.username,
          input.passwordHash,
          input.customName,
          input.chosenCharacter,
        ],
      );

      const row = result.rows[0];
      if (!row) {
        throw new Error('Failed to create user: no row returned');
      }
      return this.toEntity(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError('That username is already taken');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [id],
    );

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async findCredentialsByUsername(
    username: string,
  ): Promise<UserWithCredentials | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE lower(username) = lower($1)`,
      [username],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return { user: this.toEntity(row), passwordHash: row.password_hash };
  }

  async updateCustomName(id: string, customName: string | null): Promise<User> {
    const result = await this.pool.query<UserRow>(
      `UPDATE users
       SET custom_name = $2
       WHERE id = $1
       RETURNING ${USER_COLUMNS}`,
      [id, customName],
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundError('User not found');
    }
    return this.toEntity(row);
  }

  private toEntity(row: UserRow): User {
    if (!isCharacterId(row.chosen_character)) {
      // Stored data violates the domain invariant — surface loudly.
      throw new Error(
        `Persisted chosen_character is not a valid CharacterId: ${row.chosen_character}`,
      );
    }
    const chosenCharacter: CharacterId = row.chosen_character;
    return new User(
      row.id,
      row.username,
      row.custom_name,
      chosenCharacter,
      new Date(row.created_at),
    );
  }
}

/** Postgres unique-constraint violation (SQLSTATE 23505). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
