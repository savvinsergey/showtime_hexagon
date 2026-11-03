import { describe, it, expect } from 'vitest';
import { asUserId, UsersDomainService } from '@showtime/users/domain';
import type { UsersStatePort } from '../lib/ports/driven/users-state/users-state.port';

type StateFactory = () => UsersStatePort | Promise<UsersStatePort>;

/**
 * Runs page replacement behavior shared by fake and future state adapters.
 * @param name - Adapter description used in test output.
 * @param createPort - Creates isolated state for each test.
 */
export function usersStateContract(name: string, createPort: StateFactory): void {
  describe(`${name}: state contract`, () => {
    it('Scenario: Set page replaces the list', async () => {
      const port = await createPort();
      const draft = UsersDomainService.createUserDraft(
        { email: 'ada@example.com', fullName: 'Ada Lovelace', role: 'member' },
        '2026-01-31T10:15:30.000Z',
      );
      if (!draft.ok) throw new Error('Invalid contract fixture.');
      const first = Object.freeze({ ...draft.value, id: asUserId('u-1') });
      const second = Object.freeze({ ...draft.value, id: asUserId('u-2') });
      port.setPage([first, second], 2);
      expect(port.users()).toEqual([first, second]);
      expect(port.total()).toBe(2);
      port.setPage([second], 9);
      expect(port.users()).toEqual([second]);
      expect(port.total()).toBe(9);
      port.setPage([], 0);
      expect(port.users()).toEqual([]);
      expect(port.total()).toBe(0);
    });
  });
}
