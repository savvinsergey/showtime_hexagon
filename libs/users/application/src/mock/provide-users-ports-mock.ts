import type { Provider } from '@angular/core';
import { USER_REPOSITORY } from '../lib/ports/driven/user-repository/user-repo.port';
import { USERS_STATE } from '../lib/ports/driven/users-state/users-state.port';
import { UserRepositoryMock as UserRepoMock } from './user-repo.mock';
import { UsersStateMock } from './users-state.mock';

/**
 * Binds fresh in-memory driven ports for one test injector.
 * @returns Providers for both mocks and their port tokens, sharing each instance.
 */
export function provideUsersPortsMock(): Provider[] {
  return [
    { provide: UserRepoMock, useFactory: () => new UserRepoMock() },
    { provide: UsersStateMock, useFactory: () => new UsersStateMock() },
    { provide: USER_REPOSITORY, useExisting: UserRepoMock },
    { provide: USERS_STATE, useExisting: UsersStateMock },
  ];
}
