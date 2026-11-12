import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';
import type { UsersEventsEnum } from '../../enums/users-events/users-events.enum';

/**
 * A user was moved to the inactive lifecycle state.
 */
export type UserDeactivated = DomainEvent &
  Readonly<{
    type: UsersEventsEnum.UserDeactivated;
    userId: UserId;
  }>;
