/**
 * Stable Users-owned names for domain events emitted after state transitions.
 */
export enum UsersEventsEnum {
  UserRoleChanged = 'users.user-role-changed',
  UserActivated = 'users.user-activated',
  UserDeactivated = 'users.user-deactivated',
  UserRegistered = 'users.user-registered',
  UserRenamed = 'users.user-renamed',
}
