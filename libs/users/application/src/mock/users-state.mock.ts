import { signal } from '@angular/core';
import type { User } from '@showtime/users/domain';
import type { UsersStatePort } from '../lib/ports/driven';

/**
 * Plain-signal in-memory implementation of {@link UsersStatePort} for tests.
 */
export class UsersStateMock implements UsersStatePort {
  private readonly pageUsers = signal<User[]>([]);
  private readonly pageTotal = signal(0);

  /**
   * Last replacement page, exposed without write access.
   */
  readonly users = this.pageUsers.asReadonly();

  /**
   * Last replacement total, exposed without write access.
   */
  readonly total = this.pageTotal.asReadonly();

  /**
   * Replaces page data synchronously while isolating the supplied array.
   * @param users - Complete new page.
   * @param total - Matching total across pages.
   */
  setPage(users: User[], total: number): void {
    this.pageUsers.set([...users]);
    this.pageTotal.set(total);
  }
}
