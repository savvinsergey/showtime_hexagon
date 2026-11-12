import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';
import type { UsersEventsEnum } from '../../enums/users-events/users-events.enum';

/**
 * A persisted user has received its backend-assigned identity.
 */
export type UserRegistered = DomainEvent &
  Readonly<{
    type: UsersEventsEnum.UserRegistered;
    userId: UserId;
  }>;
