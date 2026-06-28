import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../../ports/driven/PasswordHasher.js';

const DEFAULT_SALT_ROUNDS = 10;

/**
 * bcrypt-backed PasswordHasher. Pure-JS implementation (bcryptjs) so it works
 * on Alpine/Docker without native compilation.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds: number = DEFAULT_SALT_ROUNDS) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
