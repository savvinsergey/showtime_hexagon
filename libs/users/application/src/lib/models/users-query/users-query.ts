/**
 * A requested users page; page numbers start at one and pageSize limits the result count.
 */
export type UsersQuery = Readonly<{
  page: number;
  pageSize: number;
}>;
