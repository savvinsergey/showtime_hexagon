import type { DomainEvent } from '@showtime/shared/kernel';
import type { UserId } from '../../value-objects';
import type { UsersEventsEnum } from '../../enums/users-events/users-events.enum';

/**
 * A user received a structurally valid full name.
 */
export type UserRenamed = DomainEvent &
  Readonly<{
    type: UsersEventsEnum.UserRenamed;
    userId: UserId;
  }>;
