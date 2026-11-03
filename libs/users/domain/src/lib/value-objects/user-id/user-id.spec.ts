import type { Id } from '@showtime/shared/kernel';
import { asUserId, type UserId } from './user-id';

describe('UserId', () => {
  it('Scenario: Id stays a plain string', () => {
    const id = asUserId('u-1');

    expect(typeof id).toBe('string');
    expect(JSON.stringify(id)).toBe('"u-1"');
  });

  it.each(['', '  ', 'unstructured/id'])(
    'does not impose identifier format validation (%j)',
    raw => {
      expect(asUserId(raw)).toBe(raw);
    },
  );

  it('Scenario: Foreign id is not assignable', () => {
    const foreignId = 'order-1' as Id<'Order'>;
    // @ts-expect-error -- ids branded for another entity cannot become UserId
    const userId: UserId = foreignId;

    expect(userId).toBe('order-1');
  });
});
