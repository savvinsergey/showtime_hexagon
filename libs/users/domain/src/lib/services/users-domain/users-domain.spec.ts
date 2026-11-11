import {
  UserRoleEnum,
  asUserId,
  UsersDomainService,
  type User,
  type UserChange,
} from '../../../index';

const now = '2026-01-31T10:15:30.000Z';
const input = { email: 'ada@example.com', fullName: 'Ada Lovelace', role: UserRoleEnum.Member };

/**
 * Gives transition tests a validated persisted user without reading a clock.
 */
function userFixture(status: User['status'] = 'active'): User {
  const draft = UsersDomainService.createUserDraft(input, now);
  if (!draft.ok) throw new Error('Invalid test fixture');
  return Object.freeze({ ...draft.value, id: asUserId('u-1'), status });
}

/**
 * Checks all mutable containers in a transition's returned plain data.
 */
function expectFrozenChange(change: UserChange<unknown>): void {
  expect(Object.isFrozen(change)).toBe(true);
  expect(Object.isFrozen(change.user)).toBe(true);
  expect(Object.isFrozen(change.events)).toBe(true);
  expect(change.events).toHaveLength(1);
  expect(Object.isFrozen(change.events[0])).toBe(true);
}

describe('UsersDomainService', () => {
  it('Scenario: Valid input becomes an active draft', () => {
    const result = UsersDomainService.createUserDraft(input, now);

    expect(result).toEqual({ ok: true, value: { ...input, status: 'active' } });
    if (!result.ok) return expect.unreachable('Expected a draft');
    expect(Object.isFrozen(result.value)).toBe(true);
  });

  it('Scenario: Draft omits id', () => {
    const result = UsersDomainService.createUserDraft(input, now);

    if (!result.ok) return expect.unreachable('Expected a draft');
    expect(result.value).not.toHaveProperty('id');
  });

  it('Scenario: Known role is accepted', () => {
    const result = UsersDomainService.createUserDraft({ ...input, role: 'admin' }, now);

    expect(result).toMatchObject({ ok: true, value: { role: 'admin' } });
  });

  it('Scenario: Unknown role is rejected', () => {
    const result = UsersDomainService.createUserDraft({ ...input, role: 'superuser' }, now);

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid-role' } });
    expect(result).not.toHaveProperty('value');
  });

  it('Scenario: Invalid input does not produce a draft', () => {
    const result = UsersDomainService.createUserDraft({ ...input, email: 'invalid' }, now);

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid-email' } });
    expect(result).not.toHaveProperty('value');
  });

  it('rejects an empty name before producing a draft', () => {
    expect(UsersDomainService.createUserDraft({ ...input, fullName: ' ' }, now)).toMatchObject({
      ok: false,
      error: { code: 'invalid-full-name' },
    });
  });

  it('Scenario: Time is taken from the argument', () => {
    const dateRead = vi.spyOn(globalThis, 'Date').mockImplementation(() => {
      throw new Error('Domain must not read the system clock');
    });
    try {
      expect(UsersDomainService.createUserDraft(input, now).ok).toBe(true);
      expect(UsersDomainService.createUserDraft(input, '2027-01-01T00:00:00.000Z').ok).toBe(true);
      expect(dateRead).not.toHaveBeenCalled();
    } finally {
      dateRead.mockRestore();
    }
  });

  it('Scenario: Deactivate sets inactive and emits an event', () => {
    const original = userFixture();
    const change = UsersDomainService.deactivate(original, now);

    expect(change.user).toEqual({ ...original, status: 'inactive' });
    expect(change.user).not.toBe(original);
    expect(original.status).toBe('active');
    expect(change.events).toEqual([
      { type: 'users.user-deactivated', userId: 'u-1', occurredAt: now },
    ]);
    expectFrozenChange(change);
  });

  it('Scenario: Activate sets active and emits an event', () => {
    const original = userFixture('inactive');
    const change = UsersDomainService.activate(original, now);

    expect(change.user).toEqual({ ...original, status: 'active' });
    expect(change.user).not.toBe(original);
    expect(original.status).toBe('inactive');
    expect(change.events).toEqual([
      { type: 'users.user-activated', userId: 'u-1', occurredAt: now },
    ]);
    expectFrozenChange(change);
  });

  it('Scenario: Rename with a valid name succeeds', () => {
    const original = userFixture();
    const result = UsersDomainService.rename(original, '  Grace Hopper  ', now);

    if (!result.ok) return expect.unreachable('Expected a renamed user');
    expect(result.value.user).toEqual({ ...original, fullName: 'Grace Hopper' });
    expect(result.value.user).not.toBe(original);
    expect(original.fullName).toBe('Ada Lovelace');
    expect(result.value.events).toEqual([
      { type: 'users.user-renamed', userId: 'u-1', occurredAt: now },
    ]);
    expectFrozenChange(result.value);
  });

  it.each(['', '  '])('Scenario: Rename with an empty name fails (%j)', name => {
    const original = userFixture();
    const result = UsersDomainService.rename(original, name, now);

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid-full-name' } });
    expect(result).not.toHaveProperty('value');
    expect(result).not.toHaveProperty('events');
    expect(original.fullName).toBe('Ada Lovelace');
  });

  it('Scenario: Change role with a known role succeeds', () => {
    const original = userFixture();
    const result = UsersDomainService.changeRole(original, 'admin', now);

    if (!result.ok) return expect.unreachable('Expected a changed role');
    expect(result.value.user).toEqual({ ...original, role: 'admin' });
    expect(result.value.user).not.toBe(original);
    expect(original.role).toBe('member');
    expect(result.value.events).toEqual([
      { type: 'users.user-role-changed', userId: 'u-1', occurredAt: now },
    ]);
    expectFrozenChange(result.value);
  });

  it('Scenario: Change role with an unknown role fails', () => {
    const original = userFixture();
    const result = UsersDomainService.changeRole(original, 'superuser', now);

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid-role' } });
    expect(result).not.toHaveProperty('value');
    expect(result).not.toHaveProperty('events');
    expect(original.role).toBe('member');
  });

  it("Scenario: Registered event uses the user's id", () => {
    const user = userFixture();
    const event = UsersDomainService.userRegistered(user, now);

    expect(event).toEqual({ type: 'users.user-registered', userId: user.id, occurredAt: now });
    expect(Object.isFrozen(event)).toBe(true);
  });
});

describe('raw role compatibility', () => {
  it.each([
    ['admin', UserRoleEnum.Admin],
    ['member', UserRoleEnum.Member],
  ])('Scenario: Raw supported roles still validate (%s)', (rawRole, expected) => {
    const original = userFixture();
    const draft = UsersDomainService.createUserDraft({ ...input, role: rawRole }, now);
    const change = UsersDomainService.changeRole(original, rawRole, now);
    if (!draft.ok || !change.ok) return expect.unreachable('Expected valid raw roles');
    expect(draft.value.role).toBe(expected);
    expect(draft.value.status).toBe('active');
    expect(change.value.user.role).toBe(expected);
    expect(change.value.events).toEqual([
      { type: 'users.user-role-changed', userId: original.id, occurredAt: now },
    ]);
    expect(original.role).toBe(UserRoleEnum.Member);
    expectFrozenChange(change.value);
  });

  it.each(['', ' ', 'superuser'])('Scenario: Invalid roles remain rejected (%j)', role => {
    const original = userFixture();
    const results = [
      UsersDomainService.createUserDraft({ ...input, role }, now),
      UsersDomainService.changeRole(original, role, now),
    ];
    for (const result of results) {
      expect(result).toMatchObject({ ok: false, error: { code: 'invalid-role' } });
      expect(result).not.toHaveProperty('value');
      expect(result).not.toHaveProperty('events');
    }
    expect(original.role).toBe(UserRoleEnum.Member);
  });
});
