import { Injectable, inject } from '@angular/core';
import { err, type Result, type UseCaseAbstract } from '@showtime/shared/kernel';
import { UsersDomainService, type User } from '@showtime/users/domain';
import { CLOCK } from '@showtime/shared/kernel';
import type { NewUser, UsersError } from '../../../models';
import { USER_REPOSITORY } from '../../../ports/driven';
import { toUsersValidationError } from '../../domain-error/to-users-validation-error';

/**
 * Validates and persists registration; status and list reloads belong to the driving facade.
 */
@Injectable()
export class CreateUserUseCase implements UseCaseAbstract<NewUser, User, UsersError> {
  private readonly repository = inject(USER_REPOSITORY);
  private readonly clock = inject(CLOCK);

  /**
   * Creates a user without changing page state or publishing events.
   * @param input - Raw values supplied for registration.
   * @returns Persisted user or an application failure, preserving repository error details.
   */
  async execute(input: NewUser): Promise<Result<User, UsersError>> {
    const now = this.clock.now();
    const draft = UsersDomainService.createUserDraft(input, now);

    if (!draft.ok) {
      return err(toUsersValidationError(draft.error));
    }

    const saved = await this.repository.create(draft.value);
    if (saved.ok) {
      // Registration becomes a fact only after persistence assigns the identity.
      // Event publication waits for the first real subscriber in a later change.
      UsersDomainService.userRegistered(saved.value, now);
    }
    return saved;
  }
}
