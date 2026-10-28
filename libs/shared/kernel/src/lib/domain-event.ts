/**
 * Base shape of a domain event: something that happened in the domain, recorded as plain data.
 *
 * Contexts extend it with their own payload (for example `DomainEvent & { userId: Id<'User'> }`).
 * It holds only strings, so it survives `JSON.stringify` / `JSON.parse` unchanged.
 */
export type DomainEvent = Readonly<{
  /**
   * Event name that identifies its kind, for example `users.user-deactivated`.
   */
  type: string;
  /**
   * Moment the event occurred, as an ISO-8601 string (take it from a `Clock`).
   */
  occurredAt: string;
}>;
