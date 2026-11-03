import { InjectionToken, type Signal } from '@angular/core';
import type { User, UserId } from '@showtime/users/domain';
import type { NewUser } from '../../../models/new-user/new-user';
import type { UpdateUser } from '../../../models/update-user/update-user';
import type { UsersQuery } from '../../../models/users-query/users-query';
import type { UsersPage } from '../../../models/users-page/users-page';
import type { UseCaseCall } from '../../../models/use-case-call/use-case-call';
import type { OperationStatus } from '../../../models/operation-status/operation-status';

/**
 * One driving boundary for screens; consumers render statuses and react to result promises.
 */
// eslint-disable-next-line unicorn/name-replacements -- UsersApplicationPort is the approved driving contract name.
export interface UsersApplicationPort {
  /**
   * Last successfully loaded page records.
   */
  readonly users: Signal<User[]>;
  /**
   * Total matching record count across pages.
   */
  readonly total: Signal<number>;
  /**
   * Latest list request, including automatic reloads after persisted mutations.
   */
  readonly listStatus: Signal<OperationStatus>;
  /**
   * Loads the latest requested page; superseded calls become cancelled and cannot write state.
   * @param query - Requested page; remembered for later successful mutation reloads.
   * @returns This load's status and repository result.
   */
  load(query: UsersQuery): UseCaseCall<UsersPage>;
  /**
   * Reads one user without replacing the current list.
   * @param id - User identity.
   * @returns This lookup's status and result.
   */
  get(id: UserId): UseCaseCall<User>;
  /**
   * Persists validated registration and triggers a reload if a list query was previously loaded.
   * @param input - Raw registration values.
   * @returns Persistence status/result, independent of any reload failure.
   */
  create(input: NewUser): UseCaseCall<User>;
  /**
   * Persists validated name/role replacements and triggers a remembered-query reload.
   * @param input - Existing identity and raw replacement values.
   * @returns Persistence status/result, independent of any reload failure.
   */
  update(input: UpdateUser): UseCaseCall<User>;
  /**
   * Persists deactivation and triggers a remembered-query reload.
   * @param id - User identity.
   * @returns Persistence status/result, independent of any reload failure.
   */
  deactivate(id: UserId): UseCaseCall<User>;
}

/**
 * Driving binding supplied by provideUsersApplication, separate from concrete driven adapters.
 */
export const USERS_APPLICATION = new InjectionToken<UsersApplicationPort>('USERS_APPLICATION');
