import {
  Injectable,
  computed,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import type { User, UserId } from '@showtime/users/domain';
import type { NewUser } from '../../models/new-user/new-user';
import type { UpdateUser } from '../../models/update-user/update-user';
import type { UsersQuery } from '../../models/users-query/users-query';
import type { UsersPage } from '../../models/users-page/users-page';
import type { UsersError } from '../../models/users-error/users-error';
import type { OperationStatus } from '../../models/operation-status/operation-status';
import type { UseCaseCall } from '../../models/use-case-call/use-case-call';
import type { UsersApplicationPort as UsersAppPort } from '../../ports/driving/users-app/users-app.port';
import { USERS_STATE } from '../../ports/driven/users-state/users-state.port';
import { CreateUserUseCase } from '../../use-cases/commands/create-user/create-user';
import { GetUserUseCase } from '../../use-cases/commands/get-user/get-user';
import { LoadUsersUseCase } from '../../use-cases/commands/load-users/load-users';
import { UpdateUserUseCase } from '../../use-cases/commands/update-user/update-user';
import { DeactivateUserUseCase } from '../../use-cases/commands/deactivate-user/deactivate-user';
import { UsersViewUseCase } from '../../use-cases/queries/users-view/users-view';

/**
 * Coordinates operation lifecycles and latest-list writes behind the single driving port.
 */
@Injectable()
// eslint-disable-next-line unicorn/name-replacements -- UsersApplicationService is the approved internal facade name.
export class UsersApplicationService implements UsersAppPort {
  private readonly createUser = inject(CreateUserUseCase);
  private readonly getUser = inject(GetUserUseCase);
  private readonly loadUsers = inject(LoadUsersUseCase);
  private readonly updateUser = inject(UpdateUserUseCase);
  private readonly deactivateUser = inject(DeactivateUserUseCase);
  private readonly view = inject(UsersViewUseCase);
  private readonly state = inject(USERS_STATE);
  private readonly currentListStatus = signal<Signal<OperationStatus>>(
    signal<OperationStatus>({ status: 'idle' }),
  );
  private activeLoad: WritableSignal<OperationStatus> | undefined;
  private loadGeneration = 0;
  private lastQuery: UsersQuery | undefined;

  /**
   * Last successfully loaded page.
   */
  readonly users = this.view.users;
  /**
   * Matching total across pages.
   */
  readonly total = this.view.total;
  /**
   * Latest load's lifecycle, including automatic mutation reloads.
   */
  readonly listStatus = computed(() => this.currentListStatus()());

  private completedStatus<T>(outcome: Result<T, UsersError>): OperationStatus {
    return outcome.ok ? { status: 'success' } : { status: 'error', error: outcome.error };
  }

  private async resolveLoad(
    query: UsersQuery,
    generation: number,
    status: WritableSignal<OperationStatus>,
  ): Promise<Result<UsersPage, UsersError>> {
    const outcome = await this.loadUsers.execute(query);
    if (generation !== this.loadGeneration) return outcome;
    if (outcome.ok) this.state.setPage(outcome.value.users, outcome.value.total);
    status.set(this.completedStatus(outcome));
    return outcome;
  }

  private async resolveCall<T>(
    execute: () => Promise<Result<T, UsersError>>,
    status: WritableSignal<OperationStatus>,
    shouldReload: boolean,
  ): Promise<Result<T, UsersError>> {
    const outcome = await execute();
    status.set(this.completedStatus(outcome));
    if (shouldReload && outcome.ok && this.lastQuery) this.load(this.lastQuery);
    return outcome;
  }

  private run<T>(
    execute: () => Promise<Result<T, UsersError>>,
    shouldReload = false,
  ): UseCaseCall<T> {
    const status = signal<OperationStatus>({ status: 'loading' });
    return { status: status.asReadonly(), result: this.resolveCall(execute, status, shouldReload) };
  }

  /**
   * Loads a page and grants only the newest request permission to replace state.
   * @param query - Query to remember for successful mutation reloads.
   * @returns An independent call whose status is cancelled when superseded.
   */
  load(query: UsersQuery): UseCaseCall<UsersPage> {
    if (this.activeLoad?.().status === 'loading') this.activeLoad.set({ status: 'cancelled' });
    const generation = ++this.loadGeneration;
    this.lastQuery = { ...query };
    const status = signal<OperationStatus>({ status: 'loading' });
    this.activeLoad = status;
    this.currentListStatus.set(status.asReadonly());
    const result = this.resolveLoad(this.lastQuery, generation, status);
    return { status: status.asReadonly(), result };
  }

  /**
   * Reads an identity independently of list loading.
   * @param id - User identity.
   * @returns This lookup's status and result.
   */
  get(id: UserId): UseCaseCall<User> {
    return this.run(() => this.getUser.execute(id));
  }

  /**
   * Persists registration and starts the remembered-query reload after success.
   * @param input - Raw registration values.
   * @returns Persistence status/result unaffected by reload errors.
   */
  create(input: NewUser): UseCaseCall<User> {
    return this.run(() => this.createUser.execute(input), true);
  }

  /**
   * Persists replacement values and starts the remembered-query reload after success.
   * @param input - Identity and raw replacement values.
   * @returns Persistence status/result unaffected by reload errors.
   */
  update(input: UpdateUser): UseCaseCall<User> {
    return this.run(() => this.updateUser.execute(input), true);
  }

  /**
   * Persists deactivation and starts the remembered-query reload after success.
   * @param id - User identity.
   * @returns Persistence status/result unaffected by reload errors.
   */
  deactivate(id: UserId): UseCaseCall<User> {
    return this.run(() => this.deactivateUser.execute(id), true);
  }
}
