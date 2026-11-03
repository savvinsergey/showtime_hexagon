import type { UsersError } from '../users-error/users-error';

/**
 * Observable lifecycle of one application operation; only an error status carries a failure.
 */
export type OperationStatus =
  | Readonly<{ status: 'idle' | 'loading' | 'success' | 'cancelled' }>
  | Readonly<{ status: 'error'; error: UsersError }>;
