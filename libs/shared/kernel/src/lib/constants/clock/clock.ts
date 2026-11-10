import type { Clock } from '../../types/clock/clock';

/**
 * Clock backed by the real system time.
 */
export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};
