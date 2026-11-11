import { UserStatusEnum } from '../../enums/user-status/user-status.enum';

/**
 * Lifecycle states recognized by the users domain.
 */
export type UserStatus = UserStatusEnum;

/**
 * Narrows an untrusted status to the domain's closed set.
 * @param value - Value received at a boundary.
 * @returns Whether the value is a supported status.
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return value === UserStatusEnum.Active || value === UserStatusEnum.Inactive;
}
