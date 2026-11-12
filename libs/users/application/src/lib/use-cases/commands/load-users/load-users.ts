import { Injectable, inject } from '@angular/core';
import type { Result, UseCaseAbstract } from '@showtime/shared/kernel';
import type { UsersError, UsersPage, UsersQuery } from '../../../models';
import { USER_REPOSITORY } from '../../../ports/driven';

/**
 * Reads a requested page without writing state before the facade arbitrates request freshness.
 */
@Injectable()
export class LoadUsersUseCase implements UseCaseAbstract<UsersQuery, UsersPage, UsersError> {
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
