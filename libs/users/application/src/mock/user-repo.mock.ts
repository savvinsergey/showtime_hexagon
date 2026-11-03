import { err, ok, type Result } from '@showtime/shared/kernel';
import { asUserId, type User, type UserDraft, type UserId } from '@showtime/users/domain';
import type { UserRepositoryPort as UserRepoPort } from '../lib/ports/driven/user-repository/user-repo.port';
import type { UsersError } from '../lib/models/users-error/users-error';
import type { UsersPage } from '../lib/models/users-page/users-page';
import type { UsersQuery } from '../lib/models/users-query/users-query';

/**
 * Deterministic in-memory implementation of {@link UserRepoPort} for application tests.
 */
// eslint-disable-next-line unicorn/name-replacements -- UserRepositoryMock is the approved test contract name.
export class UserRepositoryMock implements UserRepoPort {
  private readonly records = new Map<UserId, User>();
  private nextId = 0;

  /**
   * Reads the requested slice without changing stored records.
   * @param query - One-based page and page size.
   * @returns Page data with the complete record count.
   */
  async findAll(query: UsersQuery): Promise<Result<UsersPage, UsersError>> {
    const users = Array.from(this.records, ([, user]) => user);
    const start = (query.page - 1) * query.pageSize;
    return ok({ users: users.slice(start, start + query.pageSize), total: users.length });
  }

  /**
   * Looks up one identity.
   * @param id - User identity.
   * @returns Stored record or not-found.
   */
  async findById(id: UserId): Promise<Result<User, UsersError>> {
    const user = this.records.get(id);
    return user ? ok(user) : err({ kind: 'not-found', message: 'User was not found.' });
  }

  /**
   * Assigns an id and stores a frozen user without adding server business rules.
   * @param draft - Validated identity-free data.
   * @returns Persisted user with its deterministic identity.
   */
  async create(draft: UserDraft): Promise<Result<User, UsersError>> {
    const user = Object.freeze({ ...draft, id: asUserId(`mock-user-${++this.nextId}`) });
    this.records.set(user.id, user);
    return ok(user);
  }

  /**
   * Replaces an existing record rather than silently inserting a missing identity.
   * @param user - Complete replacement.
   * @returns Frozen saved user or not-found.
   */
  async save(user: User): Promise<Result<User, UsersError>> {
    if (!this.records.has(user.id))
      return err({ kind: 'not-found', message: 'User was not found.' });
    const saved = Object.freeze({ ...user });
    this.records.set(saved.id, saved);
    return ok(saved);
  }
}
