import { type Result } from '../result/result';

/**
 * Defines a typed asynchronous operation without prescribing orchestration or transport.
 * Type parameters preserve the caller's input, successful output and failure payload.
 */
export interface UseCaseAbstract<TInput, TOutput, TError> {
  /**
   * Executes the operation with its required input contract.
   * @param input - Data required by this operation.
   * @returns A promised success value or a typed failure.
   */
  execute(input: TInput): Promise<Result<TOutput, TError>>;
}
