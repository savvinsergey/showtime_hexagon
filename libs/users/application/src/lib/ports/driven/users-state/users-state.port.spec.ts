import type { Signal } from '@angular/core';
import type { User } from '@showtime/users/domain';
import type { UsersStatePort } from './users-state.port';

describe('UsersStatePort type contract', () => {
  it('Scenario: Query is not on the state port', () => {
    expectTypeOf<keyof UsersStatePort>().toEqualTypeOf<'users' | 'total' | 'setPage'>();
    expectTypeOf<UsersStatePort>().not.toHaveProperty('query');
    expectTypeOf<UsersStatePort>().not.toHaveProperty('selectedId');
    expectTypeOf<UsersStatePort>().not.toHaveProperty('selection');
    expectTypeOf<UsersStatePort>().not.toHaveProperty('status');
    expectTypeOf<UsersStatePort>().not.toHaveProperty('listStatus');
  });

  it('exposes page signals and a synchronous replacement command', () => {
    expectTypeOf<UsersStatePort['users']>().toEqualTypeOf<Signal<User[]>>();
    expectTypeOf<UsersStatePort['total']>().toEqualTypeOf<Signal<number>>();
    expectTypeOf<UsersStatePort['setPage']>().toEqualTypeOf<
      (users: User[], total: number) => void
    >();
  });
});
