import {
  UserRoleEnum,
  UserStatusEnum,
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
    status: UserStatusEnum.Active,
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
      user.status = UserStatusEnum.Inactive;
    }).toThrow(TypeError);
    expect(user.status).toBe(UserStatusEnum.Active);
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

describe('enum-backed status types', () => {
  it('Scenario: Typed models require status enum members', () => {
    const user: User = { ...userFixture(), status: UserStatusEnum.Inactive };
    const draft: UserDraft = { ...user, status: UserStatusEnum.Active };
    expectTypeOf<User['status']>().toEqualTypeOf<UserStatusEnum>();
    expectTypeOf<UserDraft['status']>().toEqualTypeOf<UserStatusEnum>();
    // @ts-expect-error -- persisted users require enum members even for valid wire values
    const rawActiveUser: User = { ...user, status: 'active' };
    // @ts-expect-error -- persisted users reject raw inactive values
    const rawInactiveUser: User = { ...user, status: 'inactive' };
    // @ts-expect-error -- persisted users reject unknown statuses
    const invalidUser: User = { ...user, status: 'pending' };
    // @ts-expect-error -- drafts require enum members even for valid wire values
    const rawActiveDraft: UserDraft = { ...draft, status: 'active' };
    // @ts-expect-error -- drafts reject raw inactive values
    const rawInactiveDraft: UserDraft = { ...draft, status: 'inactive' };
    // @ts-expect-error -- drafts reject unknown statuses
    const invalidDraft: UserDraft = { ...draft, status: 'pending' };
    expect([rawActiveUser.status, rawInactiveUser.status, invalidUser.status]).toEqual([
      'active',
      'inactive',
      'pending',
    ]);
    expect([rawActiveDraft.status, rawInactiveDraft.status, invalidDraft.status]).toEqual([
      'active',
      'inactive',
      'pending',
    ]);
  });
});
