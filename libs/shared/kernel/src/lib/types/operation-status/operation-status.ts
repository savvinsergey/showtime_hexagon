import { OperationStatusEnum } from '../../enums/operation-status/operation-status.enum';

/**
 * Lifecycle of an operation with a caller-defined error required for the error variant.
 */
export type OperationStatus<E> =
  | Readonly<{ status: OperationStatusEnum.Idle }>
  | Readonly<{ status: OperationStatusEnum.Loading }>
  | Readonly<{ status: OperationStatusEnum.Success }>
  | Readonly<{ status: OperationStatusEnum.Error; error: E }>
  | Readonly<{ status: OperationStatusEnum.Cancelled }>;
