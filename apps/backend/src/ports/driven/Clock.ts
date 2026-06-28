/**
 * Driven port providing the current time. Abstracted so application/domain code
 * stays deterministic and testable.
 */
export interface Clock {
  now(): Date;
}
