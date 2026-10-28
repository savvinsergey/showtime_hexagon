import type { DomainError } from './domain-error';

/**
 * Successful outcome of an operation, carrying a value.
 *
 * Plain data: it survives `JSON.stringify` / `JSON.parse` unchanged.
 */
export type Success<T> = Readonly<{
  /**
   * Discriminant: always `true` for a success.
   */
  ok: true;
  /**
   * The value produced by the operation.
   */
  value: T;
}>;

/**
 * Failed outcome of an operation, carrying an error.
 *
 * Plain data: it survives `JSON.stringify` / `JSON.parse` unchanged.
 */
export type Failure<E> = Readonly<{
  /**
   * Discriminant: always `false` for a failure.
   */
  ok: false;
  /**
   * The error describing why the operation failed.
   */
  error: E;
}>;

/**
 * Either a success carrying a value or a failure carrying an error, discriminated by `ok`.
 *
 * Narrow it with `if (result.ok)` to read `value` or `error` without a cast.
 *
 * @typeParam T Type of the success value.
 * @typeParam E Type of the failure error; defaults to {@link DomainError}.
 */
export type Result<T, E = DomainError> = Success<T> | Failure<E>;

/**
 * Creates a successful result.
 *
 * @param value The value to carry.
 * @returns A `Success` result with `ok: true`.
 */
export function ok<T>(value: T): Success<T> {
  return { ok: true, value };
}

/**
 * Creates a failed result.
 *
 * @param error The error to carry.
 * @returns A `Failure` result with `ok: false`.
 */
// eslint-disable-next-line unicorn/name-replacements -- `err` is the specified constructor name
export function err<E>(error: E): Failure<E> {
  return { ok: false, error };
}
