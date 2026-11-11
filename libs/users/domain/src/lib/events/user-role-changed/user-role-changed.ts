import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';

/**
 * A user received a recognized role.
 */
export type UserRoleChanged = DomainEvent &
  Readonly<{
    type: 'users.user-role-changed';
    userId: UserId;
  }>;
