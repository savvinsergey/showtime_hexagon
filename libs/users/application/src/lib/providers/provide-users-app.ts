import type { Provider } from '@angular/core';
import { USERS_APPLICATION } from '../ports/driving';
import { UsersApplicationService as UsersAppService } from '../services/users-app/users-app.service';
import {
  CreateUserUseCase,
  GetUserUseCase,
  LoadUsersUseCase,
  UpdateUserUseCase,
  DeactivateUserUseCase,
} from '../use-cases/commands';
import { UsersViewUseCase } from '../use-cases/queries';

/**
 * Binds the users driving facade and internal use-cases, leaving driven adapters to the composition root.
 * @returns Application-only providers; callers separately supply repository and state bindings.
 */
// eslint-disable-next-line unicorn/name-replacements -- provideUsersApplication is the approved public provider name.
export function provideUsersApplication(): Provider[] {
  return [
    CreateUserUseCase,
    GetUserUseCase,
    LoadUsersUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    UsersViewUseCase,
    UsersAppService,
    { provide: USERS_APPLICATION, useExisting: UsersAppService },
  ];
}
