import * as usersEntry from './index';
import { CLOCK } from '@shared/kernel/angular';
import type { User as DomainUser } from '@showtime/users/domain';
import type { User } from './index';

describe('users-application scaffold', () => {
  it('loads the public entry point', () => {
    expect(usersEntry).toBeDefined();
  });

  it('Scenario: Use-cases are not exported', () => {
    expect(new Set(Object.keys(usersEntry))).toEqual(
      new Set([
        'CLOCK',
        'USERS_APPLICATION',
        'USERS_STATE',
        'USER_REPOSITORY',
        'provideUsersApplication',
      ]),
    );
  });

  it('Scenario: User type is exported from application', () => {
    expectTypeOf<User>().toEqualTypeOf<DomainUser>();
  });

  it('exports the shared kernel clock token by identity', () => {
    expect(usersEntry.CLOCK).toBe(CLOCK);
  });
});
