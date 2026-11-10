/**
 * Lifecycle of an operation with a caller-defined error type.
 */
export type OperationStatus<E> =
  | Readonly<{ status: 'idle' | 'loading' | 'success' | 'cancelled' }>
  | Readonly<{ status: 'error'; error: E }>;
