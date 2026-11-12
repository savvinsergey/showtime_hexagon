import { ErrorKindEnum } from '@showtime/shared/kernel';
import type { DomainError } from '@showtime/shared/kernel';
import type { UsersError } from '../../models';
import { UserErrorsEnum, UserFieldNameByErrorConst } from '@showtime/users/domain';

/**
 * Translates structural failures without exposing domain error objects to consumers.
 * @param error - Failure returned by users domain validation.
 * @returns An application validation error with a known input field when available.
 */
export function toUsersValidationError(
  error: DomainError,
): Extract<UsersError, { kind: ErrorKindEnum.Validation }> {
  const code = Object.values(UserErrorsEnum).find(knownCode => knownCode === error.code);
  const field = code === undefined ? undefined : UserFieldNameByErrorConst[code];
  return {
    kind: ErrorKindEnum.Validation,
    message: error.message,
    ...(field && { fieldIssues: { [field]: error.message } }),
  };
}
