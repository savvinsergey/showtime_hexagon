import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects/user-id/user-id';

/**
 * A user received a structurally valid full name.
 */
export type UserRenamed = DomainEvent &
  Readonly<{
    type: 'users.user-renamed';
    userId: UserId;
  }>;
