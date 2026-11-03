import type { DomainEvent } from './domain-event';
import type { Id } from './id';

describe('DomainEvent', () => {
  it('Scenario: event is plain data - contains type and occurredAt and survives JSON unchanged', () => {
    const event: DomainEvent = {
      type: 'users.user-deactivated',
      occurredAt: '2026-01-31T10:15:30.000Z',
    };

    // eslint-disable-next-line unicorn/prefer-structured-clone -- the JSON round trip is the behavior under test
    const restored = JSON.parse(JSON.stringify(event)) as DomainEvent;

    expect(Object.keys(event)).toEqual(['type', 'occurredAt']);
    expect(restored).toEqual(event);
  });

  it('survives JSON unchanged when a context extends it with an id payload', () => {
    type UserDeactivated = DomainEvent & Readonly<{ userId: Id<'User'> }>;
    const event: UserDeactivated = {
      type: 'users.user-deactivated',
      occurredAt: '2026-01-31T10:15:30.000Z',
      userId: 'user-42' as Id<'User'>,
    };

    // eslint-disable-next-line unicorn/prefer-structured-clone -- the JSON round trip is the behavior under test
    const restored = JSON.parse(JSON.stringify(event)) as UserDeactivated;

    expect(restored).toEqual(event);
  });
});
