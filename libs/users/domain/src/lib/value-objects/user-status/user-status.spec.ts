import { isUserStatus, type UserStatus } from './user-status';

describe('UserStatus', () => {
  it.each(['active', 'inactive'])('accepts known status %s', status => {
    expect(isUserStatus(status)).toBe(true);
  });

  it.each(['pending', '', 'ACTIVE', undefined, null, 1, {}])(
    'rejects unknown status %j',
    status => {
      expect(isUserStatus(status)).toBe(false);
    },
  );

  it('Scenario: Unknown status is not a domain value', () => {
    // @ts-expect-error -- pending is outside the closed domain status set
    const invalidStatus: UserStatus = 'pending';

    expect(isUserStatus(invalidStatus)).toBe(false);
  });
});
