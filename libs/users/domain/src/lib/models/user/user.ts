import type { Email, FullName, UserId, UserRole, UserStatus } from '../../value-objects';

/**
 * Serializable user shared across layers without class instances or mutable fields.
 * Domain operations return frozen records rather than changing an existing user.
 */
export type User = Readonly<{
  id: UserId;
  email: Email;
  fullName: FullName;
  role: UserRole;
  status: UserStatus;
}>;

/**
 * Validated user data before the backend assigns its identity.
 */
export type UserDraft = Omit<User, 'id'>;
