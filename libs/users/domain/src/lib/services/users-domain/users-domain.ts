import { domainError, err, ok, type Result } from '@showtime/shared/kernel';
import type { Email } from '../../value-objects/email/email';
import type { FullName } from '../../value-objects/full-name/full-name';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(value);
}

function isFullName(value: string): boolean {
  return value.length > 0;
}

/**
 * Validates email structure for immediate feedback; uniqueness remains server-owned.
 * @param raw - Unvalidated email input.
 * @returns A trimmed email or an error with stable code `invalid-email`.
 */
export function parseEmail(raw: string): Result<Email> {
  const value = raw.trim();
  return isEmail(value)
    ? ok(value as Email)
    : err(domainError('invalid-email', 'Email must contain a local part and a domain.'));
}

/**
 * Validates the name's structure without imposing business-specific naming rules.
 * @param raw - Unvalidated full-name input.
 * @returns A trimmed full name or an error with stable code `invalid-full-name`.
 */
export function parseFullName(raw: string): Result<FullName> {
  const value = raw.trim();
  return isFullName(value)
    ? ok(value as FullName)
    : err(domainError('invalid-full-name', 'Full name must not be empty.'));
}
