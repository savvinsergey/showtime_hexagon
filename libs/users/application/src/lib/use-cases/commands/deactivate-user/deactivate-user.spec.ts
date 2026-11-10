import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { err, fixedClock } from '@showtime/shared/kernel';
import { UsersDomainService, type User } from '@showtime/users/domain';
import {
  UserRepositoryMock as UserRepoMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import { CLOCK } from '@showtime/shared/kernel';
import { DeactivateUserUseCase } from './deactivate-user';

describe('DeactivateUserUseCase', () => {
  let user: User;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideUsersPortsMock(),
        DeactivateUserUseCase,
        { provide: CLOCK, useValue: fixedClock('2026-01-31T10:15:30.000Z') },
      ],
    });
    const draft = UsersDomainService.createUserDraft(
      {
        email: 'ada@example.com',
        fullName: 'Ada Lovelace',
        role: 'member',
      },
      '2026-01-31T10:15:30.000Z',
    );
    if (!draft.ok) throw new Error('Invalid fixture');
    const saved = await TestBed.inject(UserRepoMock).create(draft.value);
    if (!saved.ok) throw new Error('Expected persisted fixture');
    user = saved.value;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('saves the inactive replacement without changing the original user', async () => {
    const save = vi.spyOn(TestBed.inject(UserRepoMock), 'save');
    const result = await TestBed.inject(DeactivateUserUseCase).execute(user.id);

    expect(result).toEqual({ ok: true, value: { ...user, status: 'inactive' } });
    expect(save).toHaveBeenCalledExactlyOnceWith({ ...user, status: 'inactive' });
    expect(user.status).toBe('active');
  });

  it('preserves lookup failures without calling save', async () => {
    const repo = TestBed.inject(UserRepoMock);
    const failure = err({ kind: 'network' as const, message: 'Offline' });
    vi.spyOn(repo, 'findById').mockResolvedValue(failure);
    const save = vi.spyOn(repo, 'save');

    expect(await TestBed.inject(DeactivateUserUseCase).execute(user.id)).toBe(failure);
    expect(save).not.toHaveBeenCalled();
  });

  it('preserves a backend forbidden result after the domain transition', async () => {
    const failure = err({ kind: 'forbidden' as const, message: 'Not allowed' });
    vi.spyOn(TestBed.inject(UserRepoMock), 'save').mockResolvedValue(failure);

    expect(await TestBed.inject(DeactivateUserUseCase).execute(user.id)).toBe(failure);
  });
});
