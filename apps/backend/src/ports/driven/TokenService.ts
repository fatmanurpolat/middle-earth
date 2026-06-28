export interface TokenPayload {
  sub: string;
}

export interface SignedToken {
  token: string;
  expiresAt: Date;
}

/**
 * Driven port for signing/verifying auth tokens and deriving the stable hash
 * stored in the sessions table.
 */
export interface TokenService {
  sign(payload: TokenPayload): SignedToken;
  verify(token: string): TokenPayload | null;
  hash(token: string): string;
}
