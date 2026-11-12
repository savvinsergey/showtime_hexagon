import { UserRoleEnum } from '@showtime/users/domain';
import { ErrorKindEnum } from '@showtime/shared/kernel';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { err, fixedClock } from '@showtime/shared/kernel';
import { UsersDomainService, type User } from '@showtime/users/domain';
import {
  UserRepositoryMock as UserRepoMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import { CLOCK } from '@showtime/shared/kernel';
import { UpdateUserUseCase } from './update-user';

describe('UpdateUserUseCase', () => {
  let user: User;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideUsersPortsMock(),
        UpdateUserUseCase,
        { provide: CLOCK, useValue: fixedClock('2026-01-31T10:15:30.000Z') },
      ],
    });
    const draft = UsersDomainService.createUserDraft({
      email: 'ada@example.com',
      fullName: 'Ada Lovelace',
      role: UserRoleEnum.Member,
    });
    if (!draft.ok) throw new Error('Invalid fixture');
    const saved = await TestBed.inject(UserRepoMock).create(draft.value);
    if (!saved.ok) throw new Error('Expected persisted fixture');
    user = saved.value;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('saves the renamed user with the new role without mutating its original', async () => {
    const save = vi.spyOn(TestBed.inject(UserRepoMock), 'save');
    const result = await TestBed.inject(UpdateUserUseCase).execute({
      id: user.id,
      fullName: 'Grace Hopper',
      role: UserRoleEnum.Admin,
    });

    expect(result).toEqual({
      ok: true,
      value: { ...user, fullName: 'Grace Hopper', role: 'admin' },
    });
    expect(save).toHaveBeenCalledExactlyOnceWith({
      ...user,
      fullName: 'Grace Hopper',
      role: 'admin',
    });
    expect(user.fullName).toBe('Ada Lovelace');
    expect(user.role).toBe('member');
  });

  it('Scenario: Invalid rename is validation', async () => {
    const save = vi.spyOn(TestBed.inject(UserRepoMock), 'save');
    const result = await TestBed.inject(UpdateUserUseCase).execute({
      id: user.id,
      fullName: ' ',
      role: UserRoleEnum.Admin,
    });

    expect(result).toMatchObject({
      ok: false,
      error: { kind: ErrorKindEnum.Validation, fieldIssues: { fullName: expect.any(String) } },
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects an unknown role without saving a partial rename', async () => {
    const repo = TestBed.inject(UserRepoMock);
    const save = vi.spyOn(repo, 'save');
    const result = await TestBed.inject(UpdateUserUseCase).execute({
      id: user.id,
      fullName: 'Grace Hopper',
      role: 'superuser',
    });

    expect(result).toMatchObject({
      ok: false,
      error: { kind: ErrorKindEnum.Validation, fieldIssues: { role: expect.any(String) } },
    });
    expect(save).not.toHaveBeenCalled();
    expect(await repo.findById(user.id)).toEqual({ ok: true, value: user });
  });

  it('preserves lookup failures and never saves after them', async () => {
    const repo = TestBed.inject(UserRepoMock);
    const failure = err({ kind: ErrorKindEnum.NotFound as const, message: 'Missing' });
    vi.spyOn(repo, 'findById').mockResolvedValue(failure);
    const save = vi.spyOn(repo, 'save');

    expect(
      await TestBed.inject(UpdateUserUseCase).execute({
        id: user.id,
        fullName: 'Grace Hopper',
        role: UserRoleEnum.Admin,
      }),
    ).toBe(failure);
    expect(save).not.toHaveBeenCalled();
  });

  it('preserves a backend conflict after valid frontend input', async () => {
    const failure = err({ kind: ErrorKindEnum.Conflict as const, message: 'Record changed' });
    vi.spyOn(TestBed.inject(UserRepoMock), 'save').mockResolvedValue(failure);

    expect(
      await TestBed.inject(UpdateUserUseCase).execute({
        id: user.id,
        fullName: 'Grace Hopper',
        role: UserRoleEnum.Admin,
      }),
    ).toBe(failure);
  });
});
