import { ErrorKindEnum } from '@showtime/shared/kernel';
import { toUsersValidationError } from './to-users-validation-error';

describe('toUsersValidationError', () => {
  it.each([
    ['invalid-email', 'email'],
    ['invalid-full-name', 'fullName'],
    ['invalid-role', 'role'],
  ])('maps %s to the %s field', (code, field) => {
    expect(toUsersValidationError({ code, message: 'Invalid input' })).toEqual({
      kind: ErrorKindEnum.Validation,
      message: 'Invalid input',
      fieldIssues: { [field]: 'Invalid input' },
    });
  });

  it.each(['unrecognized-code', '', 'toString', 'constructor', '__proto__'])(
    'omits field issues for unknown code %s',
    code => {
      expect(toUsersValidationError({ code, message: 'Invalid input' })).toEqual({
        kind: ErrorKindEnum.Validation,
        message: 'Invalid input',
      });
    },
  );
});
