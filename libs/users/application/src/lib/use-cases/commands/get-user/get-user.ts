import { Injectable, inject } from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import type { User, UserId } from '@showtime/users/domain';
import type { UsersError } from '../../../models';
import { USER_REPOSITORY } from '../../../ports/driven';

/**
 * Reads one user without changing the current page or its operation status.
 */
@Injectable()
export class GetUserUseCase {
  private readonly repository = inject(USER_REPOSITORY);

  /**
   * Looks up an identity through the repository boundary.
   * @param id - Requested user's identity.
   * @returns Repository user or application failure, including not-found, unchanged.
   */
  execute(id: UserId): Promise<Result<User, UsersError>> {
    return this.repository.findById(id);
  }
}
