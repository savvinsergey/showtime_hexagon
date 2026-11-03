import { InjectionToken } from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import type { User, UserDraft, UserId } from '@showtime/users/domain';
import type { UsersError } from '../../../models/users-error/users-error';
import type { UsersPage } from '../../../models/users-page/users-page';
import type { UsersQuery } from '../../../models/users-query/users-query';

/**
 * Persistence boundary shared by users queries and commands.
 * Implementations translate failures into UsersError results and never throw or reject.
 */
// eslint-disable-next-line unicorn/name-replacements -- UserRepositoryPort is the approved public contract name.
export interface UserRepositoryPort {
  /**
   * Reads a page without changing application state.
   * @param query - Requested page and size.
   * @returns The matching users and total, or an application failure.
   */
  findAll(query: UsersQuery): Promise<Result<UsersPage, UsersError>>;

  /**
   * Reads one persisted user.
   * @param id - Identity supplied by the caller.
   * @returns The user, or a not-found/other application failure.
   */
  findById(id: UserId): Promise<Result<User, UsersError>>;

  /**
   * Persists validated data and lets the backend assign its identity.
   * @param draft - Validated user with no id.
   * @returns The persisted user with its assigned id, or an application failure.
   */
  create(draft: UserDraft): Promise<Result<User, UsersError>>;

  /**
   * Persists a replacement for an existing user.
   * @param user - Validated record carrying an existing identity.
   * @returns The saved user, or an application failure.
   */
  save(user: User): Promise<Result<User, UsersError>>;
}

/**
 * Repository binding supplied by the composition root; application knows no concrete adapter.
 */
export const USER_REPOSITORY = new InjectionToken<UserRepositoryPort>('USER_REPOSITORY');
