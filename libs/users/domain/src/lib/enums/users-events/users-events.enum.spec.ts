import { UsersEventsEnum } from '../../../index';

describe('UsersEventsEnum', () => {
  it('exports the established event names through the public entry', () => {
    expect(UsersEventsEnum).toEqual({
      UserRoleChanged: 'users.user-role-changed',
      UserActivated: 'users.user-activated',
      UserDeactivated: 'users.user-deactivated',
      UserRegistered: 'users.user-registered',
      UserRenamed: 'users.user-renamed',
    });
    expect(JSON.stringify(Object.values(UsersEventsEnum))).toBe(
      '["users.user-role-changed","users.user-activated","users.user-deactivated","users.user-registered","users.user-renamed"]',
    );
  });
});
