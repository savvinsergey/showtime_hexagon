import { UserStatusEnum } from './user-status.enum';
import { UserStatusEnum as PublicUserStatusEnum } from '../../../index';

describe('UserStatusEnum', () => {
  it('Scenario: Status enum preserves serialized values', () => {
    expect(PublicUserStatusEnum).toBe(UserStatusEnum);
    expect(UserStatusEnum).toEqual({ Active: 'active', Inactive: 'inactive' });
    expect(JSON.stringify(Object.values(UserStatusEnum))).toBe('["active","inactive"]');
  });
});
