import { UsersErrorKindEnum as PublicUsersErrorKindEnum } from '../../../index';
import { UsersErrorKindEnum } from './users-error-kind.enum';

describe('UsersErrorKindEnum', () => {
  it('Scenario: Consumer imports all error kinds', () => {
    expect(PublicUsersErrorKindEnum).toBe(UsersErrorKindEnum);
    expect(PublicUsersErrorKindEnum).toEqual({
      Validation: 'validation',
      NotFound: 'not-found',
      Conflict: 'conflict',
      Forbidden: 'forbidden',
      Network: 'network',
      Unknown: 'unknown',
    });
  });
});
