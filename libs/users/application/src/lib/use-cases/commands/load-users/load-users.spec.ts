import { ErrorKindEnum } from '@showtime/shared/kernel';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { err, ok } from '@showtime/shared/kernel';
import {
  UserRepositoryMock as UserRepoMock,
  UsersStateMock,
  provideUsersPortsMock,
} from '@showtime/users/application/mock';
import { LoadUsersUseCase } from './load-users';

describe('LoadUsersUseCase', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideUsersPortsMock(), LoadUsersUseCase],
    }),
  );
  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('forwards the query and returns the successful repository result unchanged', async () => {
    const query = { page: 3, pageSize: 2 };
    const page = ok({ users: [], total: 5 });
    const findAll = vi.spyOn(TestBed.inject(UserRepoMock), 'findAll').mockResolvedValue(page);

    expect(await TestBed.inject(LoadUsersUseCase).execute(query)).toBe(page);
    expect(findAll).toHaveBeenCalledExactlyOnceWith(query);
  });

  it('returns repository failure details unchanged', async () => {
    const failure = err({ kind: ErrorKindEnum.Network as const, message: 'Offline' });
    vi.spyOn(TestBed.inject(UserRepoMock), 'findAll').mockResolvedValue(failure);

    expect(await TestBed.inject(LoadUsersUseCase).execute({ page: 1, pageSize: 10 })).toBe(failure);
  });

  it('does not write page state before the facade arbitrates freshness', async () => {
    const state = TestBed.inject(UsersStateMock);
    state.setPage([], 7);
    const setPage = vi.spyOn(state, 'setPage');

    await TestBed.inject(LoadUsersUseCase).execute({ page: 1, pageSize: 10 });

    expect(setPage).not.toHaveBeenCalled();
    expect(state.users()).toEqual([]);
    expect(state.total()).toBe(7);
  });
});
