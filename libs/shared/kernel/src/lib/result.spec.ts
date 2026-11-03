import { domainError, type DomainError } from './domain-error';
// eslint-disable-next-line unicorn/name-replacements -- `err` is the specified constructor name
import { err, ok, type Result } from './result';

/**
 * Returns a Result whose variant is not known statically (avoids assignment narrowing).
 */
function produceUnnarrowed(): Result<number, string> {
  return ok(1);
}

describe('Result', () => {
  it('successful result carries the value after narrowing', () => {
    const result: Result<number> = ok(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const value: number = result.value;
      expect(value).toBe(42);
    } else {
      expect.unreachable('expected a success');
    }
  });

  it('failed result carries the error after narrowing', () => {
    const failure = domainError('users.not-found', 'User was not found');
    const result: Result<number> = err(failure);

    expect(result.ok).toBe(false);
    if (result.ok) {
      expect.unreachable('expected a failure');
    } else {
      const error: DomainError = result.error;
      expect(error).toEqual(failure);
    }
  });

  it('supports a custom error type', () => {
    const result: Result<string, 'empty'> = err('empty');

    expect(result.ok).toBe(false);
    if (result.ok) {
      expect.unreachable('expected a failure');
    } else {
      const error: 'empty' = result.error;
      expect(error).toBe('empty');
    }
  });

  it('is a discriminated union: value and error are not readable before narrowing', () => {
    const result = produceUnnarrowed();

    // @ts-expect-error -- `value` exists only on the success variant
    const value: number = result.value;
    // @ts-expect-error -- `error` exists only on the failure variant
    const error: string = result.error;

    // Runtime check: the un-narrowed success still has no `error`, and vice versa.
    expect(value).toBe(1);
    expect(error).toBeUndefined();
  });

  it('is serializable: ok flag and payload survive a JSON round trip', () => {
    const success: Result<{ id: string }> = ok({ id: 'u1' });
    const failure: Result<{ id: string }> = err(domainError('users.failed', 'Failed'));

    const successJson = JSON.stringify(success);
    const failureJson = JSON.stringify(failure);

    expect(JSON.parse(successJson)).toEqual({ ok: true, value: { id: 'u1' } });
    expect(JSON.parse(failureJson)).toEqual({
      ok: false,
      error: { code: 'users.failed', message: 'Failed' },
    });
  });
});
