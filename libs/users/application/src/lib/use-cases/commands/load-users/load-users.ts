import { Injectable, inject } from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import type { UsersError } from '../../../models/users-error/users-error';
import type { UsersPage } from '../../../models/users-page/users-page';
import type { UsersQuery } from '../../../models/users-query/users-query';
import { USER_REPOSITORY } from '../../../ports/driven/user-repository/user-repo.port';

/**
 * Reads a requested page without writing state before the facade arbitrates request freshness.
 */
@Injectable()
export class LoadUsersUseCase {
  private readonly repository = inject(USER_REPOSITORY);

  /**
   * Forwards a page query to persistence.
   * @param query - Requested users page.
   * @returns Repository page or application failure unchanged.
   */
  execute(query: UsersQuery): Promise<Result<UsersPage, UsersError>> {
    return this.repository.findAll(query);
  }
}
