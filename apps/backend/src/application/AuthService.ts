import type { AuthResponse } from '@middleearth/shared';
import type {
  AuthUseCase,
  LoginCommand,
  RegisterCommand,
} from '../ports/driving/AuthUseCase.js';
import type { UserRepository } from '../ports/driven/UserRepository.js';
import type { SessionRepository } from '../ports/driven/SessionRepository.js';
import type { TokenService } from '../ports/driven/TokenService.js';
import type { PasswordHasher } from '../ports/driven/PasswordHasher.js';
import { UnauthorizedError } from '../domain/errors/DomainError.js';
import type { User } from '../domain/entities/User.js';
import { toUserDTO } from './mappers.js';

/**
 * Authentication use-case implementation. Depends only on driven ports
 * (constructor-injected) — no framework or persistence specifics.
 */
export class AuthService implements AuthUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordHasher,
  ) {}

  async register(cmd: RegisterCommand): Promise<AuthResponse> {
    const passwordHash = await this.passwords.hash(cmd.password);

    // create() throws ConflictError (409) if the username is already taken.
    const user = await this.users.create({
      username: cmd.username.trim(),
      passwordHash,
      chosenCharacter: cmd.chosenCharacter,
      customName: normalizeCustomName(cmd.customName),
    });

    return this.issueSession(user);
  }

  async login(cmd: LoginCommand): Promise<AuthResponse> {
    const credentials = await this.users.findCredentialsByUsername(
      cmd.username.trim(),
    );
    if (!credentials) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const ok = await this.passwords.verify(
      cmd.password,
      credentials.passwordHash,
    );
    if (!ok) {
      throw new UnauthorizedError('Invalid username or password');
    }

    return this.issueSession(credentials.user);
  }

  async logout(tokenHash: string): Promise<void> {
    await this.sessions.deleteByTokenHash(tokenHash);
  }

  private async issueSession(user: User): Promise<AuthResponse> {
    const { token, expiresAt } = this.tokens.sign({ sub: user.id });
    await this.sessions.create(user.id, this.tokens.hash(token), expiresAt);
    return { token, user: toUserDTO(user) };
  }
}

/** Trim incoming custom name; treat empty string as "no custom name" (null). */
function normalizeCustomName(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
