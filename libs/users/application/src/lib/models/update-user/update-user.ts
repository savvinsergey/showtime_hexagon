import type { UserId } from '@showtime/users/domain';

/**
 * Raw editable values for an existing user; the domain validates replacements.
 */
export type UpdateUser = Readonly<{
  id: UserId;
  fullName: string;
  role: string;
}>;
