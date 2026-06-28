import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type {
  SignedToken,
  TokenPayload,
  TokenService,
} from '../../../ports/driven/TokenService.js';

export interface JwtTokenServiceOptions {
  secret: string;
  /** Accepts the jsonwebtoken `expiresIn` form, e.g. "7d", "12h", or seconds. */
  expiresIn: string;
}

/**
 * TokenService implementation backed by jsonwebtoken for signing/verification
 * and node:crypto SHA-256 for the stored session hash.
 */
export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(options: JwtTokenServiceOptions) {
    this.secret = options.secret;
    this.expiresIn = options.expiresIn;
  }

  sign(payload: TokenPayload): SignedToken {
    // A unique jti guarantees every signed token (and thus its stored hash) is
    // distinct, even for the same subject signed within the same second —
    // otherwise the iat/exp claims collide and the session token_hash clashes.
    const token = jwt.sign({ sub: payload.sub }, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
      jwtid: randomUUID(),
    });

    const expiresAt = this.resolveExpiry(token);
    return { token, expiresAt };
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        typeof decoded.sub === 'string'
      ) {
        return { sub: decoded.sub };
      }
      return null;
    } catch {
      return null;
    }
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Derive the absolute expiry. Prefer the `exp` claim embedded by jsonwebtoken;
   * fall back to parsing the configured duration if `exp` is unavailable.
   */
  private resolveExpiry(token: string): Date {
    const decoded = jwt.decode(token);
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.exp === 'number'
    ) {
      return new Date(decoded.exp * 1000);
    }
    return new Date(Date.now() + parseDurationMs(this.expiresIn));
  }
}

/**
 * Parse a jsonwebtoken-style duration into milliseconds. Supports a bare number
 * (seconds) or a number suffixed with s/m/h/d/w. Defaults to 7 days if invalid.
 */
function parseDurationMs(value: string): number {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const match = /^(\d+)\s*(s|m|h|d|w)$/.exec(trimmed);
  const rawAmount = match?.[1];
  const unit = match?.[2];
  if (!rawAmount || !unit) {
    return SEVEN_DAYS;
  }

  const amount = Number(rawAmount);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return amount * (unitMs[unit] ?? 1000);
}
