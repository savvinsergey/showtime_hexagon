import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';

/**
 * A persisted user has received its backend-assigned identity.
 */
export type UserRegistered = DomainEvent &
  Readonly<{
    type: 'users.user-registered';
    userId: UserId;
  }>;
