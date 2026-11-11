import { UsersErrorKindEnum } from '../../enums/users-error-kind/users-error-kind.enum';
/**
 * Application failure independent of transport details or domain error objects.
 * Validation issues identify raw input fields; unknown failures may retain a diagnostic cause.
 */
export type UsersError =
  | Readonly<{
      kind: UsersErrorKindEnum.Validation;
      message: string;
      fieldIssues?: Readonly<Partial<Record<'email' | 'fullName' | 'role', string>>>;
    }>
  | Readonly<{ kind: UsersErrorKindEnum.NotFound; message: string }>
  | Readonly<{ kind: UsersErrorKindEnum.Conflict; message: string }>
  | Readonly<{ kind: UsersErrorKindEnum.Forbidden; message: string }>
  | Readonly<{ kind: UsersErrorKindEnum.Network; message: string }>
  | Readonly<{ kind: UsersErrorKindEnum.Unknown; message: string; cause?: unknown }>;
