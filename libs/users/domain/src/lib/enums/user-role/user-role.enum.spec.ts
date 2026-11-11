import { UserRoleEnum } from './user-role.enum';

describe('UserRoleEnum', () => {
  it('Scenario: Role enum preserves wire values', () => {
    expect(UserRoleEnum).toEqual({ Admin: 'admin', Member: 'member' });
    expect(JSON.stringify(Object.values(UserRoleEnum))).toBe('["admin","member"]');
  });
});
