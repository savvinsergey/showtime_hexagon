import type { Id } from '@showtime/shared/kernel';

/**
 * User identity kept as a plain string while preventing foreign entity ids from being mixed in.
 */
export type UserId = Id<'User'>;

/**
 * Brands a backend-assigned identifier without imposing a client-side format restriction.
 * @param raw - Identifier supplied by a trusted boundary.
 * @returns The same string branded as a user id.
 */
export function asUserId(raw: string): UserId {
  return raw as UserId;
}
