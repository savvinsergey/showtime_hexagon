import { Injectable, inject } from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import { UsersDomainService, type User, type UserId } from '@showtime/users/domain';
import { CLOCK } from '@showtime/shared/kernel';
import type { UsersError } from '../../../models';
import { USER_REPOSITORY } from '../../../ports/driven';

/**
 * Persists the named deactivation transition without duplicating server permission rules.
 */
@Injectable()
export class DeactivateUserUseCase {
  private readonly repository = inject(USER_REPOSITORY);
  private readonly clock = inject(CLOCK);

  /**
   * Loads and saves an inactive replacement while leaving page state to the facade.
   * @param id - Identity of the user to deactivate.
   * @returns Saved user or unchanged repository failure; no events are published.
   */
  async execute(id: UserId): Promise<Result<User, UsersError>> {
    const current = await this.repository.findById(id);
    if (!current.ok) return current;
    const transition = UsersDomainService.deactivate(current.value, this.clock.now());
    return this.repository.save(transition.user);
  }
}
