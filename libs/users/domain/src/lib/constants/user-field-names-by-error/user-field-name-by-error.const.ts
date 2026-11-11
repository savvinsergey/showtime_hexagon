import { UserErrorsEnum } from '../../enums/user-errors/user-errors.enum';

/**
 * Associates each Users validation code with the raw input field that can be corrected.
 */
export const UserFieldNameByErrorConst: Readonly<
  Record<UserErrorsEnum, 'email' | 'fullName' | 'role'>
> = Object.freeze({
  [UserErrorsEnum.InvalidEmail]: 'email',
  [UserErrorsEnum.InvalidFullName]: 'fullName',
  [UserErrorsEnum.InvalidRole]: 'role',
});
