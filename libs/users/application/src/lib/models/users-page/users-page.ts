import type { User } from '@showtime/users/domain';

/**
 * A repository page and the total number of matching records across all pages.
 */
export type UsersPage = Readonly<{
  users: User[];
  total: number;
}>;
