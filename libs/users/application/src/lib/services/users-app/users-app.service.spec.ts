import { UsersErrorKindEnum } from '../../enums/users-error-kind/users-error-kind.enum';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { err, fixedClock, ok, type Result } from '@showtime/shared/kernel';
import { asUserId, UsersDomainService } from '@showtime/users/domain';
import {
  UserRepositoryMock as UserRepoMock,
  UsersStateMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import {
  CLOCK,
  USERS_APPLICATION,
  provideUsersApplication as provideUsersApp,
  type User,
  type UsersApplicationPort as UsersAppPort,
  type UsersError,
  type UsersPage,
} from '../../../index';

/**
 * Controls repository completion without timers or ES2024 promise APIs.
 */
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  const control: { resolve?: (value: T) => void } = {};
  const promise = new Promise<T>(resolve => {
    control.resolve = resolve;
  });
  return {
    promise,
    resolve: value => {
      if (!control.resolve) throw new Error('Expected initialized resolver');
      control.resolve(value);
    },
  };
}

const input = { email: 'ada@example.com', fullName: 'Ada Lovelace', role: 'member' };
const timestamp = '2026-01-31T10:15:30.000Z';

describe('UsersApplication driving port', () => {
  let app: UsersAppPort;
  let repo: UserRepoMock;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideUsersPortsMock(),
        provideUsersApp(),
        { provide: CLOCK, useValue: fixedClock(timestamp) },
      ],
    });
    app = TestBed.inject(USERS_APPLICATION);
    repo = TestBed.inject(UserRepoMock);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  /**
   * Seeds persistence directly so command tests do not accidentally trigger facade reloads.
   */
  async function seedUser(): Promise<User> {
    const draft = UsersDomainService.createUserDraft(input, timestamp);
    if (!draft.ok) throw new Error('Invalid fixture');
    const saved = await repo.create(draft.value);
    if (!saved.ok) throw new Error('Expected persisted fixture');
    return saved.value;
  }

  it('Scenario: Commands and reads share one token', () => {
    expect(TestBed.inject(USERS_APPLICATION)).toBe(app);
    for (const method of ['load', 'get', 'create', 'update', 'deactivate'] as const) {
      expect(app[method]).toBeTypeOf('function');
    }
    expect(app.users()).toEqual([]);
    expect(app.total()).toBe(0);
    expect(app.listStatus()).toEqual({ status: 'idle' });
  });

  it('Scenario: Successful create reports success', async () => {
    const call = app.create(input);

    expect(call.status()).toEqual({ status: 'loading' });
    const result = await call.result;
    expect(result).toMatchObject({ ok: true, value: { ...input, status: 'active' } });
    expect(call.status()).toEqual({ status: 'success' });
  });

  it('Scenario: Failed create reports error', async () => {
    const failure: UsersError = { kind: UsersErrorKindEnum.Conflict, message: 'Already exists' };
    vi.spyOn(repo, 'create').mockResolvedValue(err(failure));
    const call = app.create(input);

    expect(call.status()).toEqual({ status: 'loading' });
    expect(await call.result).toEqual({ ok: false, error: failure });
    expect(call.status()).toEqual({ status: 'error', error: failure });
  });

  it('Scenario: Result is not used to derive loading', async () => {
    const user = await seedUser();
    const persistence = deferred<Result<User, UsersError>>();
    vi.spyOn(repo, 'create').mockReturnValue(persistence.promise);
    const call = app.create(input);

    expect(call.status()).toEqual({ status: 'loading' });
    await Promise.resolve();
    expect(call.status()).toEqual({ status: 'loading' });
    persistence.resolve(ok(user));
    await call.result;
    expect(call.status()).toEqual({ status: 'success' });
  });

  it('Scenario: Invalid email on create is validation', async () => {
    const create = vi.spyOn(repo, 'create');
    const call = app.create({ ...input, email: 'invalid' });

    expect(await call.result).toMatchObject({
      ok: false,
      error: {
        kind: UsersErrorKindEnum.Validation,
        message: 'Email must contain a local part and a domain.',
        fieldIssues: { email: 'Email must contain a local part and a domain.' },
      },
    });
    expect(call.status()).toMatchObject({
      status: 'error',
      error: {
        kind: UsersErrorKindEnum.Validation,
        message: 'Email must contain a local part and a domain.',
        fieldIssues: { email: 'Email must contain a local part and a domain.' },
      },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('Scenario: Not-found is reported as kind', async () => {
    const call = app.get(asUserId('missing'));

    expect(call.status()).toEqual({ status: 'loading' });
    expect(await call.result).toMatchObject({
      ok: false,
      error: { kind: UsersErrorKindEnum.NotFound, message: 'User was not found.' },
    });
    expect(call.status()).toMatchObject({
      status: 'error',
      error: { kind: UsersErrorKindEnum.NotFound, message: 'User was not found.' },
    });
    expect(app.listStatus()).toEqual({ status: 'idle' });
  });

  it('Scenario: Unknown kind has an optional cause', async () => {
    const cause = new Error('Repository unavailable');
    const failure: UsersError = {
      kind: UsersErrorKindEnum.Unknown,
      message: 'Lookup failed',
      cause,
    };
    vi.spyOn(repo, 'findById').mockResolvedValue(err(failure));

    const call = app.get(asUserId('u-1'));
    const result = await call.result;

    if (result.ok || result.error.kind !== UsersErrorKindEnum.Unknown)
      return expect.unreachable('Expected unknown error');
    expect(result.error.cause).toBe(cause);
    expect(call.status()).toEqual({ status: 'error', error: failure });
  });

  it('Scenario: Create reloads the last page', async () => {
    const query = { page: 1, pageSize: 10 };
    await app.load(query).result;
    const findAll = vi.spyOn(repo, 'findAll');

    const result = await app.create(input).result;

    if (!result.ok) return expect.unreachable('Expected persisted user');
    expect(findAll).toHaveBeenCalledExactlyOnceWith(query);
    expect(app.users()).toEqual([result.value]);
    expect(app.total()).toBe(1);
    expect(app.listStatus()).toEqual({ status: 'success' });
  });

  it.each(['update', 'deactivate'] as const)(
    'Scenario: %s reloads the last page',
    async command => {
      const user = await seedUser();
      const query = { page: 1, pageSize: 5 };
      await app.load(query).result;
      const findAll = vi.spyOn(repo, 'findAll');
      const call =
        command === 'update'
          ? app.update({ id: user.id, fullName: 'Grace Hopper', role: 'admin' })
          : app.deactivate(user.id);

      expect(call.status()).toEqual({ status: 'loading' });
      const result = await call.result;
      if (!result.ok) return expect.unreachable('Expected mutation to succeed');
      expect(call.status()).toEqual({ status: 'success' });
      expect(findAll).toHaveBeenCalledExactlyOnceWith(query);
      expect(app.users()).toEqual([result.value]);
    },
  );

  it('Scenario: Failed create does not reload', async () => {
    await app.load({ page: 1, pageSize: 10 }).result;
    vi.spyOn(repo, 'create').mockResolvedValue(
      err({ kind: UsersErrorKindEnum.Conflict, message: 'Already exists' }),
    );
    const findAll = vi.spyOn(repo, 'findAll');

    await app.create(input).result;

    expect(findAll).not.toHaveBeenCalled();
    expect(app.listStatus()).toEqual({ status: 'success' });
  });

  it('does not reload after mutations before the first list load', async () => {
    const findAll = vi.spyOn(repo, 'findAll');
    const created = await app.create(input).result;
    if (!created.ok) return expect.unreachable('Expected persisted user');
    await app.update({ id: created.value.id, fullName: 'Grace Hopper', role: 'admin' }).result;
    await app.deactivate(created.value.id).result;

    expect(findAll).not.toHaveBeenCalled();
    expect(app.listStatus()).toEqual({ status: 'idle' });
  });

  it('Scenario: Stale load is cancelled', async () => {
    const user = await seedUser();
    const older = deferred<Result<UsersPage, UsersError>>();
    const newer = deferred<Result<UsersPage, UsersError>>();
    vi.spyOn(repo, 'findAll').mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const setPage = vi.spyOn(TestBed.inject(UsersStateMock), 'setPage');
    const first = app.load({ page: 1, pageSize: 1 });
    const second = app.load({ page: 2, pageSize: 1 });

    expect(first.status()).toEqual({ status: 'cancelled' });
    expect(second.status()).toEqual({ status: 'loading' });
    older.resolve(ok({ users: [], total: 100 }));
    await first.result;
    expect(setPage).not.toHaveBeenCalled();
    expect(first.status()).toEqual({ status: 'cancelled' });
    expect(app.listStatus()).toEqual({ status: 'loading' });
    newer.resolve(ok({ users: [user], total: 2 }));
    await second.result;
    expect(setPage).toHaveBeenCalledExactlyOnceWith([user], 2);
    expect(app.users()).toEqual([user]);
    expect(app.listStatus()).toEqual({ status: 'success' });
  });

  it('ignores a stale failure that completes after the newest success', async () => {
    const older = deferred<Result<UsersPage, UsersError>>();
    const newer = deferred<Result<UsersPage, UsersError>>();
    vi.spyOn(repo, 'findAll').mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const first = app.load({ page: 1, pageSize: 1 });
    const second = app.load({ page: 2, pageSize: 1 });
    newer.resolve(ok({ users: [], total: 2 }));
    await second.result;
    older.resolve(err({ kind: UsersErrorKindEnum.Network, message: 'Stale failure' }));
    await first.result;

    expect(first.status()).toEqual({ status: 'cancelled' });
    expect(app.total()).toBe(2);
    expect(app.listStatus()).toEqual({ status: 'success' });
  });

  it('keeps a saved mutation successful while its reload fails independently', async () => {
    await app.load({ page: 1, pageSize: 10 }).result;
    const reload = deferred<Result<UsersPage, UsersError>>();
    vi.spyOn(repo, 'findAll').mockReturnValue(reload.promise);
    const call = app.create(input);
    const result = await call.result;

    expect(result.ok).toBe(true);
    expect(call.status()).toEqual({ status: 'success' });
    expect(app.listStatus()).toEqual({ status: 'loading' });
    const failure: UsersError = { kind: UsersErrorKindEnum.Network, message: 'Reload failed' };
    reload.resolve(err(failure));
    await reload.promise;
    expect(app.listStatus()).toEqual({ status: 'error', error: failure });
    expect(call.status()).toEqual({ status: 'success' });
  });
});
