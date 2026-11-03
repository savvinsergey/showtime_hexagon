import { domainError, err, ok, type Result } from '@showtime/shared/kernel';
import type { Email } from '../../value-objects/email/email';
import type { FullName } from '../../value-objects/full-name/full-name';
import { isUserRole } from '../../value-objects/user-role/user-role';
import type { User, UserDraft } from '../../models/user/user';
import type { UserRegistered } from '../../events/user-registered/user-registered';
import type { UserActivated } from '../../events/user-activated/user-activated';
import type { UserDeactivated } from '../../events/user-deactivated/user-deactivated';
import type { UserRenamed } from '../../events/user-renamed/user-renamed';
import type { UserRoleChanged } from '../../events/user-role-changed/user-role-changed';

type DraftInput = Readonly<{ email: string; fullName: string; role: string }>;

/**
 * A transition's replacement record and the facts produced by that transition.
 */
export type UserChange<Event> = Readonly<{
  user: User;
  events: readonly Event[];
}>;

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

/**
 * Validates raw data before persistence assigns an identity.
 * @param input - Raw values submitted for registration.
 * @param _now - Explicit operation time; drafts have no timestamp field.
 * @returns A frozen active draft, or the first structural error.
 */
function createUserDraft(input: DraftInput, _now: string): Result<UserDraft> {
  const email = parseEmail(input.email);
  if (!email.ok) return email;
  const fullName = parseFullName(input.fullName);
  if (!fullName.ok) return fullName;
  if (!isUserRole(input.role)) {
    return err(domainError('invalid-role', 'Role must be admin or member.'));
  }
  return ok(
    Object.freeze({
      email: email.value,
      fullName: fullName.value,
      role: input.role,
      status: 'active',
    }),
  );
}

/**
 * Records registration only after persistence has supplied the user's identity.
 * @param user - Persisted user carrying its assigned id.
 * @param now - Event time supplied by the application.
 * @returns The frozen registration fact.
 */
function userRegistered(user: User, now: string): UserRegistered {
  return Object.freeze({ type: 'users.user-registered', userId: user.id, occurredAt: now });
}

/**
 * Expresses activation without reproducing server permission rules.
 * @param user - Existing record, left unchanged.
 * @param now - Event time supplied by the application.
 * @returns A frozen active replacement and its event.
 */
function activate(user: User, now: string): UserChange<UserActivated> {
  return Object.freeze({
    user: Object.freeze({ ...user, status: 'active' }),
    events: Object.freeze([
      Object.freeze({ type: 'users.user-activated' as const, userId: user.id, occurredAt: now }),
    ]),
  });
}

/**
 * Expresses deactivation without reproducing server permission rules.
 * @param user - Existing record, left unchanged.
 * @param now - Event time supplied by the application.
 * @returns A frozen inactive replacement and its event.
 */
function deactivate(user: User, now: string): UserChange<UserDeactivated> {
  return Object.freeze({
    user: Object.freeze({ ...user, status: 'inactive' }),
    events: Object.freeze([
      Object.freeze({ type: 'users.user-deactivated' as const, userId: user.id, occurredAt: now }),
    ]),
  });
}

/**
 * Replaces a name only when its structure is valid.
 * @param user - Existing record, left unchanged.
 * @param rawFullName - Unvalidated replacement name.
 * @param now - Event time supplied by the application.
 * @returns A frozen replacement with an event, or a structural error.
 */
function rename(user: User, rawFullName: string, now: string): Result<UserChange<UserRenamed>> {
  const fullName = parseFullName(rawFullName);
  if (!fullName.ok) return fullName;
  const event: UserRenamed = Object.freeze({
    type: 'users.user-renamed',
    userId: user.id,
    occurredAt: now,
  });
  return ok(
    Object.freeze({
      user: Object.freeze({ ...user, fullName: fullName.value }),
      events: Object.freeze([event]),
    }),
  );
}

/**
 * Replaces a role when it belongs to the closed domain set.
 * @param user - Existing record, left unchanged.
 * @param rawRole - Unvalidated replacement role.
 * @param now - Event time supplied by the application.
 * @returns A frozen replacement with an event, or a structural error.
 */
function changeRole(user: User, rawRole: string, now: string): Result<UserChange<UserRoleChanged>> {
  if (!isUserRole(rawRole)) {
    return err(domainError('invalid-role', 'Role must be admin or member.'));
  }
  const event: UserRoleChanged = Object.freeze({
    type: 'users.user-role-changed',
    userId: user.id,
    occurredAt: now,
  });
  return ok(
    Object.freeze({
      user: Object.freeze({ ...user, role: rawRole }),
      events: Object.freeze([event]),
    }),
  );
}

/**
 * Pure users behavior; callers supply time and perform persistence outside the domain.
 */
export const UsersDomainService = Object.freeze({
  createUserDraft,
  userRegistered,
  activate,
  deactivate,
  rename,
  changeRole,
});
