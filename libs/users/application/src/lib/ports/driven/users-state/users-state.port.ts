import { InjectionToken, type Signal } from '@angular/core';
import type { User } from '@showtime/users/domain';

/**
 * Last-loaded page data, independent of query, selection and operation lifecycle.
 * Implementations expose read-only signals and synchronously replace the complete page.
 */
export interface UsersStatePort {
  /**
   * Records belonging to the last successfully loaded page.
   */
  readonly users: Signal<User[]>;

  /**
   * Matching record count across all pages.
   */
  readonly total: Signal<number>;

  /**
   * Replaces page data without fetching or patching individual records.
   * @param users - Complete replacement page.
   * @param total - Total number of matching records across pages.
   */
  setPage(users: User[], total: number): void;
}

/**
 * State binding supplied by the composition root, separate from the repository adapter.
 */
export const USERS_STATE = new InjectionToken<UsersStatePort>('USERS_STATE');
