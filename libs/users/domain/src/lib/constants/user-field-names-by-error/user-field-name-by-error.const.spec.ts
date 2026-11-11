import { UserErrorsEnum } from '../../enums/user-errors/user-errors.enum';
import { UserFieldNameByErrorConst } from './user-field-name-by-error.const';

describe('UserFieldNameByErrorConst', () => {
  it('maps every validation code to its corresponding input field', () => {
    expect(UserFieldNameByErrorConst).toEqual({
      [UserErrorsEnum.InvalidEmail]: 'email',
      [UserErrorsEnum.InvalidFullName]: 'fullName',
      [UserErrorsEnum.InvalidRole]: 'role',
    });
    expect(Object.keys(UserFieldNameByErrorConst)).toEqual(Object.values(UserErrorsEnum));
    expect(Object.isFrozen(UserFieldNameByErrorConst)).toBe(true);
  });
});
