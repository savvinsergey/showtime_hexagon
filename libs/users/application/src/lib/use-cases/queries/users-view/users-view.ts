import { Injectable, inject } from '@angular/core';
import { USERS_STATE } from '../../../ports/driven';

/**
 * Exposes page reads through the state boundary without selecting a concrete store.
 */
@Injectable()
export class UsersViewUseCase {
  private readonly state = inject(USERS_STATE);
  /**
   * Last successfully loaded records.
   */
  readonly users = this.state.users;
  /**
   * Total matching record count.
   */
  readonly total = this.state.total;
}
