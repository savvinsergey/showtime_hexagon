import { OperationStatusEnum } from '../../enums/operation-status/operation-status.enum';
import type { Result } from '../../types/result/result';
import type { OperationStatus } from '../../types/operation-status/operation-status';

/**
 * Derives a terminal operation status without replacing the caller's error payload.
 * @param outcome - Resolved success or failure of the operation.
 * @returns Success for a successful result, or Error carrying the original failure.
 */
export function completedStatus<T, E>(outcome: Result<T, E>): OperationStatus<E> {
  return outcome.ok
    ? { status: OperationStatusEnum.Success }
    : { status: OperationStatusEnum.Error, error: outcome.error };
}
