/**
 * Base class for all domain-level errors. Carries a stable machine-readable
 * `code` and an HTTP status the driving adapter can map directly to the
 * shared ApiErrorBody shape. Domain layer stays framework-free.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly status: number;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    // Restore prototype chain for instanceof across transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Requested resource does not exist (404). */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly status = 404;
}

/** Input failed a domain/business rule (400). */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly status = 400;
}

/** Caller is not authenticated or session is invalid (401). */
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly status = 401;
}

/** A uniqueness/business constraint was violated, e.g. username taken (409). */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly status = 409;
}
