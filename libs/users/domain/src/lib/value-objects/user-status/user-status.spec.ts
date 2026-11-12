import { UserStatusEnum } from '../../enums/user-status/user-status.enum';
import { isUserStatus, type UserStatus } from './user-status';

describe('UserStatus', () => {
  it.each(['active', 'inactive'])('accepts known status %s', status => {
    expect(isUserStatus(status)).toBe(true);
    if (!isUserStatus(status)) return expect.unreachable('Expected a supported status');
    expectTypeOf(status).toEqualTypeOf<UserStatusEnum>();
    const narrowed: UserStatus = status;
    expect(narrowed).toBe(
      status === UserStatusEnum.Active ? UserStatusEnum.Active : UserStatusEnum.Inactive,
    );
  });

  it.each(['pending', '', ' ', 'ACTIVE', 'INACTIVE', undefined, null, 1, {}])(
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
