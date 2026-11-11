import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';

/**
 * A user was moved to the active lifecycle state.
 */
export type UserActivated = DomainEvent &
  Readonly<{
    type: 'users.user-activated';
    userId: UserId;
  }>;
