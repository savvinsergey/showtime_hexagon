import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';
import type { UsersEventsEnum } from '../../enums/users-events/users-events.enum';

/**
 * A user received a recognized role.
 */
export type UserRoleChanged = DomainEvent &
  Readonly<{
    type: UsersEventsEnum.UserRoleChanged;
    userId: UserId;
  }>;
