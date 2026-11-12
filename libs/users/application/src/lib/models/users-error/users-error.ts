import { ErrorKindEnum } from '@showtime/shared/kernel';
/**
 * Users-owned failure payload classified by the shared ErrorKindEnum, independent of transport details or domain error objects.
 * Validation issues identify raw input fields; unknown failures may retain a diagnostic cause.
 */
export type UsersError =
  | Readonly<{
      kind: ErrorKindEnum.Validation;
      message: string;
      fieldIssues?: Readonly<Partial<Record<'email' | 'fullName' | 'role', string>>>;
    }>
  | Readonly<{ kind: ErrorKindEnum.NotFound; message: string }>
  | Readonly<{ kind: ErrorKindEnum.Conflict; message: string }>
  | Readonly<{ kind: ErrorKindEnum.Forbidden; message: string }>
  | Readonly<{ kind: ErrorKindEnum.Network; message: string }>
  | Readonly<{ kind: ErrorKindEnum.Unknown; message: string; cause?: unknown }>;
