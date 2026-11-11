import { UserRoleEnum, type UserRole } from '../../../index';
import { isUserRole } from './user-role';

describe('UserRole', () => {
  it.each(['admin', 'member'])('accepts known role %s', role => {
    expect(isUserRole(role)).toBe(true);
    if (isUserRole(role)) {
      expectTypeOf(role).toEqualTypeOf<UserRole>();
      expect(Object.values(UserRoleEnum)).toContain(role);
    }
  });

  it.each(['superuser', '', ' ', ' admin ', 'ADMIN', undefined, null, 1, {}, true, []])(
    'Scenario: Invalid roles remain rejected (%j)',
    role => {
      expect(isUserRole(role)).toBe(false);
    },
  );
});
