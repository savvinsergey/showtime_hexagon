import { isUserRole } from './user-role';

describe('UserRole', () => {
  it.each(['admin', 'member'])('accepts known role %s', role => {
    expect(isUserRole(role)).toBe(true);
  });

  it.each(['superuser', '', 'ADMIN', undefined, null, 1, {}])('rejects unknown role %j', role => {
    expect(isUserRole(role)).toBe(false);
  });
});
