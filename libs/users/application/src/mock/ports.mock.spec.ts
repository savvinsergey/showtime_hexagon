import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { USER_REPOSITORY } from '../lib/ports/driven/user-repository/user-repo.port';
import { USERS_STATE } from '../lib/ports/driven/users-state/users-state.port';
import {
  UserRepositoryMock as UserRepoMock,
  UsersStateMock,
  provideUsersPortsMock,
  userRepoContract as repoContract,
  usersStateContract,
} from '@showtime/users/application/mock';

repoContract('UserRepoMock', () => new UserRepoMock());
usersStateContract('UsersStateMock', () => new UsersStateMock());

describe('provideUsersPortsMock', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('Scenario: Spec can provide mocks', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideUsersPortsMock()],
    });
    expect(TestBed.inject(USER_REPOSITORY)).toBe(TestBed.inject(UserRepoMock));
    expect(TestBed.inject(USERS_STATE)).toBe(TestBed.inject(UsersStateMock));
  });

  it('provides isolated port instances for a new injector', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideUsersPortsMock()],
    });
    const firstState = TestBed.inject(USERS_STATE);
    const firstRepo = TestBed.inject(USER_REPOSITORY);
    firstState.setPage([], 10);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideUsersPortsMock()],
    });

    expect(TestBed.inject(USERS_STATE)).not.toBe(firstState);
    expect(TestBed.inject(USER_REPOSITORY)).not.toBe(firstRepo);
    expect(TestBed.inject(USERS_STATE).total()).toBe(0);
    expect(TestBed.inject(USERS_STATE).users()).toEqual([]);
  });
});
