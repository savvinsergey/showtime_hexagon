/**
 * Shared operation lifecycle values, serialized as lowercase strings.
 */
export enum OperationStatusEnum {
  /**
   * No operation has started.
   */
  Idle = 'idle',
  /**
   * The operation is in progress.
   */
  Loading = 'loading',
  /**
   * The operation completed successfully.
   */
  Success = 'success',
  /**
   * The operation failed with a caller-defined error.
   */
  Error = 'error',
  /**
   * A newer request superseded the operation.
   */
  Cancelled = 'cancelled',
}
