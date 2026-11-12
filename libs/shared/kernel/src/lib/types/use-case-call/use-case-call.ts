import type { Signal } from '@angular/core';
import type { OperationStatus } from '../operation-status/operation-status';
import type { Result } from '../result/result';

/**
 * Read-only progress and the eventual outcome of a single application command.
 */
export type UseCaseCall<T, E> = Readonly<{
  status: Signal<OperationStatus<E>>;
  result: Promise<Result<T, E>>;
}>;
