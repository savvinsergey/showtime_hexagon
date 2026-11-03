import type { Signal } from '@angular/core';
import type { Result } from '@showtime/shared/kernel';
import type { OperationStatus } from '../operation-status/operation-status';
import type { UsersError } from '../users-error/users-error';

/**
 * One invocation's status for rendering and its result for reacting to completion.
 * Consumers derive progress/errors from status rather than from the promise.
 */
export type UseCaseCall<T> = Readonly<{
  status: Signal<OperationStatus>;
  result: Promise<Result<T, UsersError>>;
}>;
