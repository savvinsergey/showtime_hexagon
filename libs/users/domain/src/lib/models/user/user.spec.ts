import {
  UserRoleEnum,
  asUserId,
  parseEmail,
  parseFullName,
  type User,
  type UserDraft,
} from '../../../index';

/**
 * Builds a validated plain fixture without inventing a production model factory.
 */
function userFixture(): User {
  const email = parseEmail('ada@example.com');
  const fullName = parseFullName('Ada Lovelace');
  if (!email.ok || !fullName.ok) throw new Error('Invalid test fixture');
  return Object.freeze({
    id: asUserId('u-1'),
    email: email.value,
    fullName: fullName.value,
    role: UserRoleEnum.Member,
    status: 'active',
  });
}

describe('User', () => {
  it('Scenario: User serializes without wrappers', () => {
    const user = userFixture();
    const serialized = JSON.stringify(user);

    expect(Object.getPrototypeOf(user)).toBe(Object.prototype);
    expect(JSON.parse(serialized)).toEqual({
      id: 'u-1',
      email: 'ada@example.com',
      fullName: 'Ada Lovelace',
      role: 'member',
      status: 'active',
    });
  });

  it('Scenario: User fields are not mutated in place', () => {
    const user = userFixture();

    expect(() => {
      // @ts-expect-error -- User status is readonly and cannot be reassigned
      user.status = 'inactive';
    }).toThrow(TypeError);
    expect(user.status).toBe('active');
  });

  it('Scenario: Draft omits id', () => {
    const user = userFixture();
    const draft: UserDraft = Object.freeze({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    });

    expect(draft).toEqual({
      email: 'ada@example.com',
      fullName: 'Ada Lovelace',
      role: 'member',
      status: 'active',
    });
    // @ts-expect-error -- UserDraft excludes the backend-assigned identifier
    expect(draft.id).toBeUndefined();
  });
});

describe('enum-backed user types', () => {
  it('Scenario: Typed users require role enum members', () => {
    const user: User = { ...userFixture(), role: UserRoleEnum.Admin };
    const draft: UserDraft = { ...user, role: UserRoleEnum.Member };
    expectTypeOf<User['role']>().toEqualTypeOf<UserRoleEnum>();
    expectTypeOf<UserDraft['role']>().toEqualTypeOf<UserRoleEnum>();
    // @ts-expect-error -- typed persisted users require a role enum member
    const rawUser: User = { ...user, role: 'admin' };
    // @ts-expect-error -- typed drafts require a role enum member
    const rawDraft: UserDraft = { ...draft, role: 'member' };
    expect(rawUser.role).toBe('admin');
    expect(rawDraft.role).toBe('member');
  });
});
