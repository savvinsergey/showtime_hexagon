import { signal, type WritableSignal } from '@angular/core';
import { OperationStatusEnum } from '../../enums/operation-status/operation-status.enum';
import type { OperationStatus } from '../../types/operation-status/operation-status';
import type { Result } from '../../types/result/result';
import type { UseCaseCall } from '../../types/use-case-call/use-case-call';
import { completedStatus } from '../completed-status/completed-status';

/**
 * Starts a one-shot operation with an independent, read-only progress signal.
 *
 * @param execute - Operation started immediately, returning a context-owned Result.
 * @param onSuccess - Synchronous notification after Success, before result delivery.
 * Background work started by this hook is not awaited.
 * @returns A Loading call that completes with the original Result and error payload.
 * Unexpected execution throws/rejections reject its result promise and leave Loading;
 * a throwing hook rejects that promise after Success. No context error is synthesized.
 */
export function runUseCase<T, E>(
  execute: () => Promise<Result<T, E>>,
  onSuccess?: (value: T) => void,
): UseCaseCall<T, E> {
  const status = signal<OperationStatus<E>>({ status: OperationStatusEnum.Loading });
  return { status: status.asReadonly(), result: resolveCall(execute, status, onSuccess) };
}

async function resolveCall<T, E>(
  execute: () => Promise<Result<T, E>>,
  status: WritableSignal<OperationStatus<E>>,
  onSuccess?: (value: T) => void,
): Promise<Result<T, E>> {
  const outcome = await execute();

  status.set(completedStatus(outcome));

  if (outcome.ok) {
    onSuccess?.(outcome.value);
  }

  return outcome;
}
