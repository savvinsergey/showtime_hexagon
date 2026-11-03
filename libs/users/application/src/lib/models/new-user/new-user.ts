/**
 * Raw registration input; domain validation builds the trusted draft.
 */
export type NewUser = Readonly<{
  email: string;
  fullName: string;
  role: string;
}>;
