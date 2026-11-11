import { Injectable, inject } from '@angular/core';
import { err, type Result, type UseCaseAbstract } from '@showtime/shared/kernel';
import { UsersDomainService, type User } from '@showtime/users/domain';
import { CLOCK } from '@showtime/shared/kernel';
import type { UpdateUser, UsersError } from '../../../models';
import { USER_REPOSITORY } from '../../../ports/driven';
import { toUsersValidationError } from '../../domain-error/to-users-validation-error';

/**
 * Applies validated name/role replacements before saving, without changing page state.
 */
@Injectable()
export class UpdateUserUseCase implements UseCaseAbstract<UpdateUser, User, UsersError> {
  private readonly repository = inject(USER_REPOSITORY);
  private readonly clock = inject(CLOCK);

  /**
   * Loads and saves a user's validated replacements as one persistence command.
   * @param input - Existing identity and raw editable values.
   * @returns Saved user or application failure, without publishing transition events.
   */
  async execute(input: UpdateUser): Promise<Result<User, UsersError>> {
    const current = await this.repository.findById(input.id);
    if (!current.ok) {
      return current;
    }

    const now = this.clock.now();
    const renamed = UsersDomainService.rename(current.value, input.fullName, now);
    if (!renamed.ok) {
      return err(toUsersValidationError(renamed.error));
    }

    const changedRole = UsersDomainService.changeRole(renamed.value.user, input.role, now);
    if (!changedRole.ok) {
      return err(toUsersValidationError(changedRole.error));
    }

    return this.repository.save(changedRole.value.user);
  }
}
