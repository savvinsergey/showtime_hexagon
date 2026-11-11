import { UserErrorsEnum } from './user-errors.enum';

describe('UserErrorsEnum', () => {
  it('preserves the established serialized validation codes', () => {
    expect(UserErrorsEnum).toEqual({
      InvalidEmail: 'invalid-email',
      InvalidFullName: 'invalid-full-name',
      InvalidRole: 'invalid-role',
    });
    expect(JSON.stringify(Object.values(UserErrorsEnum))).toBe(
      '["invalid-email","invalid-full-name","invalid-role"]',
    );
  });
});
