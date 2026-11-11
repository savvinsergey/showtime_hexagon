import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';

/**
 * A user received a structurally valid full name.
 */
export type UserRenamed = DomainEvent &
  Readonly<{
    type: 'users.user-renamed';
    userId: UserId;
  }>;
