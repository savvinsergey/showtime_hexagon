/**
 * Framework-free users domain public API.
 */
export { parseEmail, type Email } from './lib/value-objects/email/email';
export { parseFullName, type FullName } from './lib/value-objects/full-name/full-name';
export { isUserRole, type UserRole } from './lib/value-objects/user-role/user-role';
export { isUserStatus, type UserStatus } from './lib/value-objects/user-status/user-status';
export { asUserId, type UserId } from './lib/value-objects/user-id/user-id';
export type { User, UserDraft } from './lib/models/user/user';
