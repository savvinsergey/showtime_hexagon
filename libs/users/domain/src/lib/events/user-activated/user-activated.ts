import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';
import type { UsersEventsEnum } from '../../enums/users-events/users-events.enum';

/**
 * A user was moved to the active lifecycle state.
 */
export type UserActivated = DomainEvent &
  Readonly<{
    type: UsersEventsEnum.UserActivated;
    userId: UserId;
  }>;
