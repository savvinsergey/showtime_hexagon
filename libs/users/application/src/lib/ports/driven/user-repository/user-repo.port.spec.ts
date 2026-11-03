import type { Result } from '@showtime/shared/kernel';
import type { User, UserDraft, UserId } from '@showtime/users/domain';
import type {
  UsersError,
  UsersPage,
  UsersQuery,
  UserRepositoryPort as UserRepoPort,
} from '../../../../index';

describe('UserRepoPort type contract', () => {
  it('Scenario: Remove is not on the port', () => {
    expectTypeOf<keyof UserRepoPort>().toEqualTypeOf<'findAll' | 'findById' | 'create' | 'save'>();
    // @ts-expect-error -- removing users is not part of this persistence contract
    const forbiddenMethod: keyof UserRepoPort = 'remove';
    expect(forbiddenMethod).toBe('remove');
  });

  it('accepts application/domain inputs and returns promised Result values', () => {
    expectTypeOf<UserRepoPort['findAll']>().toEqualTypeOf<
      (query: UsersQuery) => Promise<Result<UsersPage, UsersError>>
    >();
    expectTypeOf<UserRepoPort['findById']>().toEqualTypeOf<
      (id: UserId) => Promise<Result<User, UsersError>>
    >();
    expectTypeOf<UserRepoPort['create']>().toEqualTypeOf<
      (draft: UserDraft) => Promise<Result<User, UsersError>>
    >();
    expectTypeOf<UserRepoPort['save']>().toEqualTypeOf<
      (user: User) => Promise<Result<User, UsersError>>
    >();
  });
});
