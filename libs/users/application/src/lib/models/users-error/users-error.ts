/**
 * Application failure independent of transport details or domain error objects.
 * Validation issues identify raw input fields; unknown failures may retain a diagnostic cause.
 */
export type UsersError =
  | Readonly<{
      kind: 'validation';
      message: string;
      fieldIssues?: Readonly<Partial<Record<'email' | 'fullName' | 'role', string>>>;
    }>
  | Readonly<{ kind: 'not-found'; message: string }>
  | Readonly<{ kind: 'conflict'; message: string }>
  | Readonly<{ kind: 'forbidden'; message: string }>
  | Readonly<{ kind: 'network'; message: string }>
  | Readonly<{ kind: 'unknown'; message: string; cause?: unknown }>;
