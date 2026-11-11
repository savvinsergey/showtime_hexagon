import { UsersErrorKindEnum } from '../../../enums/users-error-kind/users-error-kind.enum';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { asUserId, UsersDomainService } from '@showtime/users/domain';
import {
  UserRepositoryMock as UserRepoMock,
  UsersStateMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import { GetUserUseCase } from './get-user';

describe('GetUserUseCase', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideUsersPortsMock(), GetUserUseCase],
    }),
  );
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('Scenario: Not-found is reported as kind', async () => {
    const id = asUserId('missing');
    const findById = vi.spyOn(TestBed.inject(UserRepoMock), 'findById');

    const result = await TestBed.inject(GetUserUseCase).execute(id);

    expect(result).toMatchObject({ ok: false, error: { kind: UsersErrorKindEnum.NotFound } });
    expect(findById).toHaveBeenCalledExactlyOnceWith(id);
  });

  it('returns the requested persisted user without changing list state', async () => {
    const repo = TestBed.inject(UserRepoMock);
    const draft = UsersDomainService.createUserDraft(
      {
        email: 'ada@example.com',
        fullName: 'Ada Lovelace',
        role: 'member',
      },
      '2026-01-31T10:15:30.000Z',
    );
    if (!draft.ok) return expect.unreachable('Expected fixture draft');
    const saved = await repo.create(draft.value);
    if (!saved.ok) return expect.unreachable('Expected persisted fixture');
    const findById = vi.spyOn(repo, 'findById').mockResolvedValue(saved);
    const state = TestBed.inject(UsersStateMock);
    state.setPage([], 7);
    const setPage = vi.spyOn(state, 'setPage');

    const result = await TestBed.inject(GetUserUseCase).execute(saved.value.id);

    expect(result).toBe(saved);
    expect(findById).toHaveBeenCalledExactlyOnceWith(saved.value.id);
    expect(setPage).not.toHaveBeenCalled();
    expect(state.total()).toBe(7);
  });
});
