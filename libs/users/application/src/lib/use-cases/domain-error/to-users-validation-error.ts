import { ErrorKindEnum } from '@showtime/shared/kernel';
import type { DomainError } from '@showtime/shared/kernel';
import type { UsersError } from '../../models/users-error/users-error';

/**
 * Translates structural failures without exposing domain error objects to consumers.
 * @param error - Failure returned by users domain validation.
 * @returns An application validation error with a known input field when available.
 */
export function toUsersValidationError(
  error: DomainError,
): Extract<UsersError, { kind: ErrorKindEnum.Validation }> {
  let field: 'email' | 'fullName' | 'role' | undefined;
  switch (error.code) {
    case 'invalid-email': {
      field = 'email';
      break;
    }
    case 'invalid-full-name': {
      field = 'fullName';
      break;
    }
    case 'invalid-role': {
      field = 'role';
      break;
    }
  }
  return {
    kind: ErrorKindEnum.Validation,
    message: error.message,
    ...(field && { fieldIssues: { [field]: error.message } }),
  };
}
