import type { Id } from './id';

describe('Id', () => {
  it('Scenario: identifier stays a plain string at runtime - serializes as the same string', () => {
    const userId = 'user-42' as Id<'User'>;

    expect(typeof userId).toBe('string');
    expect(JSON.stringify(userId)).toBe('"user-42"');
    expect(JSON.stringify({ id: userId })).toBe('{"id":"user-42"}');
  });

  it('Scenario: identifiers of different entities are not interchangeable - fails type checking', () => {
    const userId = 'same-value' as Id<'User'>;

    // Compile-time assertion only: `tsc` reports an unused-directive error if the brands ever become
    // assignable, which fails the type-check (and typed lint) of this spec.
    // @ts-expect-error -- an `Id<'User'>` must not be assignable to an `Id<'Order'>`
    const orderId: Id<'Order'> = userId;

    expect(orderId).toBeDefined();
  });

  it('Scenario: identifiers of different entities are not interchangeable - same entity type stays assignable', () => {
    const userId = 'user-42' as Id<'User'>;
    const sameBrand: Id<'User'> = userId;

    expect(sameBrand).toBe(userId);
  });

  it('is still usable as a string', () => {
    const userId = 'user-42' as Id<'User'>;
    const asString: string = userId;

    expect(asString.toUpperCase()).toBe('USER-42');
  });
});
