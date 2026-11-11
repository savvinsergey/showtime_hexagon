import { UsersErrorKindEnum } from '../lib/enums/users-error-kind/users-error-kind.enum';
import { describe, it, expect } from 'vitest';
import { asUserId, UsersDomainService } from '@showtime/users/domain';
import type { UserRepositoryPort as UserRepoPort } from '../lib/ports/driven/user-repository/user-repo.port';

type RepoFactory = () => UserRepoPort | Promise<UserRepoPort>;

/**
 * Runs persistence behavior shared by the fake and future repository adapters.
 * @param name - Adapter description used in test output.
 * @param createPort - Creates an isolated empty repository for each test.
 */
export function userRepoContract(name: string, createPort: RepoFactory): void {
  describe(`${name}: repository contract`, () => {
    it('Scenario: Create takes a draft and returns a user with id', async () => {
      const port = await createPort();
      const draft = UsersDomainService.createUserDraft(
        { email: 'ada@example.com', fullName: 'Ada Lovelace', role: 'member' },
        '2026-01-31T10:15:30.000Z',
      );
      if (!draft.ok) throw new Error('Invalid contract fixture.');
      const result = await port.create(draft.value);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(typeof result.value.id).toBe('string');
      expect(result.value.id.length).toBeGreaterThan(0);
      expect(result.value).toMatchObject(draft.value);
      expect(await port.findById(result.value.id)).toEqual(result);
      expect(await port.findAll({ page: 1, pageSize: 10 })).toEqual({
        ok: true,
        value: { users: [result.value], total: 1 },
      });
      const renamed = UsersDomainService.rename(
        result.value,
        'Grace Hopper',
        '2026-01-31T10:15:30.000Z',
      );
      if (!renamed.ok) throw new Error('Invalid rename fixture.');
      const saved = await port.save(renamed.value.user);
      expect(saved).toEqual({ ok: true, value: renamed.value.user });
      expect(await port.findById(result.value.id)).toEqual(saved);
    });

    it('returns not-found results for missing identities', async () => {
      const port = await createPort();
      expect(await port.findById(asUserId('missing'))).toMatchObject({
        ok: false,
        error: { kind: UsersErrorKindEnum.NotFound },
      });
    });

    it('paginates users while preserving the complete matching total', async () => {
      const port = await createPort();
      const ids: string[] = [];
      for (const name of ['Ada', 'Grace', 'Katherine']) {
        const draft = UsersDomainService.createUserDraft(
          {
            email: `${name.toLowerCase()}@example.com`,
            fullName: name,
            role: 'member',
          },
          '2026-01-31T10:15:30.000Z',
        );
        if (!draft.ok) throw new Error('Invalid contract fixture.');
        const created = await port.create(draft.value);
        if (!created.ok) throw new Error('Expected creation to succeed.');
        ids.push(created.value.id);
      }
      expect(new Set(ids).size).toBe(3);
      const first = await port.findAll({ page: 1, pageSize: 2 });
      const second = await port.findAll({ page: 2, pageSize: 2 });
      if (!first.ok || !second.ok) throw new Error('Expected page reads to succeed.');
      expect(first.value.users).toHaveLength(2);
      expect(second.value.users).toHaveLength(1);
      expect(first.value.total).toBe(3);
      expect(second.value.total).toBe(3);
      expect(new Set([...first.value.users, ...second.value.users].map(user => user.id))).toEqual(
        new Set(ids),
      );
      expect(await port.findAll({ page: 3, pageSize: 2 })).toEqual({
        ok: true,
        value: { users: [], total: 3 },
      });
    });

    it('returns not-found when saving a missing user without inserting it', async () => {
      const port = await createPort();
      const draft = UsersDomainService.createUserDraft(
        {
          email: 'ada@example.com',
          fullName: 'Ada Lovelace',
          role: 'member',
        },
        '2026-01-31T10:15:30.000Z',
      );
      if (!draft.ok) throw new Error('Invalid contract fixture.');
      const result = await port.save({ ...draft.value, id: asUserId('missing') });
      expect(result).toMatchObject({ ok: false, error: { kind: UsersErrorKindEnum.NotFound } });
      expect(await port.findAll({ page: 1, pageSize: 10 })).toEqual({
        ok: true,
        value: { users: [], total: 0 },
      });
    });
  });
}
