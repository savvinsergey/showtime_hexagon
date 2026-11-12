import { UserRoleEnum } from '../../enums/user-role/user-role.enum';

/**
 * Roles recognized by the users domain without duplicating server permissions.
 */
export type UserRole = UserRoleEnum;

/**
 * Narrows an untrusted role to the domain's closed set.
 * @param value - Value received at a boundary.
 * @returns Whether the value is a supported role.
 */
export function isUserRole(value: unknown): value is UserRole {
  return value === UserRoleEnum.Admin || value === UserRoleEnum.Member;
}
