import type { Email } from '../../value-objects/email/email';
import type { FullName } from '../../value-objects/full-name/full-name';
import type { UserId } from '../../value-objects/user-id/user-id';
import type { UserRole } from '../../value-objects/user-role/user-role';
import type { UserStatus } from '../../value-objects/user-status/user-status';

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
