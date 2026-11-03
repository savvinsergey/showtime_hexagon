/**
 * Lifecycle states recognized by the users domain.
 */
export type UserStatus = 'active' | 'inactive';

/**
 * Narrows an untrusted status to the domain's closed set.
 * @param value - Value received at a boundary.
 * @returns Whether the value is a supported status.
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return value === 'active' || value === 'inactive';
}
