import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects/user-id/user-id';

/**
 * A user was moved to the inactive lifecycle state.
 */
export type UserDeactivated = DomainEvent &
  Readonly<{
    type: 'users.user-deactivated';
    userId: UserId;
  }>;
