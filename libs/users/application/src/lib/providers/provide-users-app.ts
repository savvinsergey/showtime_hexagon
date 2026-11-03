import type { Provider } from '@angular/core';
import { USERS_APPLICATION } from '../ports/driving/users-app/users-app.port';
import { UsersApplicationService as UsersAppService } from '../services/users-app/users-app.service';
import { CreateUserUseCase } from '../use-cases/commands/create-user/create-user';
import { GetUserUseCase } from '../use-cases/commands/get-user/get-user';
import { LoadUsersUseCase } from '../use-cases/commands/load-users/load-users';
import { UpdateUserUseCase } from '../use-cases/commands/update-user/update-user';
import { DeactivateUserUseCase } from '../use-cases/commands/deactivate-user/deactivate-user';
import { UsersViewUseCase } from '../use-cases/queries/users-view/users-view';

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
