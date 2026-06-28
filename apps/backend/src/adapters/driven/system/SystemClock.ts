import type { Clock } from '../../../ports/driven/Clock.js';

/**
 * Real wall-clock implementation of the Clock port.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
