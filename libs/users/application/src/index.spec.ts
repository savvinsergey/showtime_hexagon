import * as usersEntry from './index';
import type { Signal } from '@angular/core';
import {
  CLOCK,
  ErrorKindEnum,
  OperationStatusEnum,
  type OperationStatus,
  type UseCaseCall,
} from '@showtime/shared/kernel';
import type { User as DomainUser, UserId } from '@showtime/users/domain';
import type {
  NewUser,
  UpdateUser,
  User,
  UsersApplicationPort as UsersAppPort,
  UsersError,
  UsersPage,
  UsersQuery,
} from './index';

describe('users-application scaffold', () => {
  it('Scenario: Application exposes the kernel enum identity', () => {
    expect(usersEntry.ErrorKindEnum).toBe(ErrorKindEnum);
    expectTypeOf<UsersError['kind']>().toEqualTypeOf<ErrorKindEnum>();
  });

  it('Scenario: Old enum name is removed', () => {
    expect(usersEntry).not.toHaveProperty('UsersErrorKindEnum');
    // @ts-expect-error -- migrate callers to the shared ErrorKindEnum export
    expectTypeOf<typeof import('./index').UsersErrorKindEnum>();
  });

  it('loads the public entry point', () => {
    expect(usersEntry).toBeDefined();
  });

  it('Scenario: Use-cases are not exported', () => {
    expect(new Set(Object.keys(usersEntry))).toEqual(
      new Set([
        'CLOCK',
        'ErrorKindEnum',
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

  it('Scenario: Users specializes shared contracts', () => {
    expectTypeOf<UsersAppPort['load']>().toEqualTypeOf<
      (query: UsersQuery) => UseCaseCall<UsersPage, UsersError>
    >();
    expectTypeOf<UsersAppPort['get']>().toEqualTypeOf<
      (id: UserId) => UseCaseCall<User, UsersError>
    >();
    expectTypeOf<UsersAppPort['create']>().toEqualTypeOf<
      (input: NewUser) => UseCaseCall<User, UsersError>
    >();
    expectTypeOf<UsersAppPort['update']>().toEqualTypeOf<
      (input: UpdateUser) => UseCaseCall<User, UsersError>
    >();
    expectTypeOf<UsersAppPort['deactivate']>().toEqualTypeOf<
      (id: UserId) => UseCaseCall<User, UsersError>
    >();
    expectTypeOf<UsersAppPort['listStatus']>().toEqualTypeOf<Signal<OperationStatus<UsersError>>>();
    expectTypeOf<
      ReturnType<UsersAppPort['listStatus']>['status']
    >().toEqualTypeOf<OperationStatusEnum>();
    expectTypeOf<
      Extract<
        ReturnType<UsersAppPort['listStatus']>,
        { status: OperationStatusEnum.Error }
      >['error']
    >().toEqualTypeOf<UsersError>();
  });

  it('exports the shared kernel clock token by identity', () => {
    expect(usersEntry.CLOCK).toBe(CLOCK);
  });
});
