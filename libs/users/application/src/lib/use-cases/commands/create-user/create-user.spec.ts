import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { err, fixedClock } from '@showtime/shared/kernel';
import { UsersDomainService } from '@showtime/users/domain';
import {
  UserRepositoryMock as UserRepoMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import { CLOCK } from '../../../clock/clock.token';
import type { UsersError } from '../../../models/users-error/users-error';
import { CreateUserUseCase } from './create-user';

const timestamp = '2026-01-31T10:15:30.000Z';
const input = { email: 'ada@example.com', fullName: 'Ada Lovelace', role: 'member' };

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideUsersPortsMock(),
        CreateUserUseCase,
        { provide: CLOCK, useValue: fixedClock(timestamp) },
      ],
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('returns the persisted user with its assigned identity', async () => {
    const result = await TestBed.inject(CreateUserUseCase).execute(input);

    if (!result.ok) return expect.unreachable('Expected persisted user');
    expect(result.value.id).toBeTruthy();
    expect(result.value).toMatchObject({ ...input, status: 'active' });
  });

  it('Scenario: Invalid email on create is validation', async () => {
    const create = vi.spyOn(TestBed.inject(UserRepoMock), 'create');
    const result = await TestBed.inject(CreateUserUseCase).execute({ ...input, email: 'invalid' });

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'validation', fieldIssues: { email: expect.any(String) } },
    });
    expect(result).not.toHaveProperty('error.code');
    expect(create).not.toHaveBeenCalled();
  });

  it.each([
    ['fullName', ''],
    ['role', 'superuser'],
  ] as const)('maps invalid %s to its known field without persistence', async (field, value) => {
    const create = vi.spyOn(TestBed.inject(UserRepoMock), 'create');
    const result = await TestBed.inject(CreateUserUseCase).execute({ ...input, [field]: value });

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'validation', fieldIssues: { [field]: expect.any(String) } },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['conflict', 'unknown'] as const)('preserves repository %s details', async kind => {
    const cause = { diagnostic: 'repository failure' };
    const failure: UsersError =
      kind === 'unknown' ? { kind, message: 'Failed', cause } : { kind, message: 'Already exists' };
    vi.spyOn(TestBed.inject(UserRepoMock), 'create').mockResolvedValue(err(failure));

    const result = await TestBed.inject(CreateUserUseCase).execute(input);

    expect(result).toEqual({ ok: false, error: failure });
    if (!result.ok) expect(result.error).toBe(failure);
  });

  it('uses the injected clock and preserves the successful repository result', async () => {
    const repo = TestBed.inject(UserRepoMock);
    const draft = UsersDomainService.createUserDraft(input, timestamp);
    if (!draft.ok) return expect.unreachable('Expected draft');
    const persisted = await repo.create(draft.value);
    vi.spyOn(repo, 'create').mockResolvedValue(persisted);
    const clock = vi.spyOn(TestBed.inject(CLOCK), 'now');

    const result = await TestBed.inject(CreateUserUseCase).execute(input);

    expect(result).toBe(persisted);
    expect(clock).toHaveBeenCalledOnce();
    expect(clock.mock.results[0].value).toBe(timestamp);
  });
});
