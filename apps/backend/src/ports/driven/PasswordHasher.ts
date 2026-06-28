/**
 * Driven port for password hashing/verification. Keeps the application layer
 * free of any specific crypto library (bcrypt, argon2, ...).
 */
export interface PasswordHasher {
  /** Hash a plaintext password for storage. */
  hash(plain: string): Promise<string>;
  /** Verify a plaintext password against a stored hash. */
  verify(plain: string, hash: string): Promise<boolean>;
}
