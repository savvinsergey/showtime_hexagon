import type { UsersError } from './users-error';

describe('UsersError', () => {
  it('Scenario: Unknown kind has an optional cause', () => {
    const cause = new Error('unrecognized repository failure');
    const withCause: UsersError = { kind: 'unknown', message: 'Failed', cause };
    const withoutCause: UsersError = { kind: 'unknown', message: 'Failed' };

    expect(withCause.kind).toBe('unknown');
    expect(withCause.cause).toBe(cause);
    expect(withoutCause.cause).toBeUndefined();
  });

  it('keeps transport-independent failures as a closed discriminated union', () => {
    expectTypeOf<UsersError['kind']>().toEqualTypeOf<
      'validation' | 'not-found' | 'conflict' | 'forbidden' | 'network' | 'unknown'
    >();
    expectTypeOf<Extract<UsersError, { kind: 'validation' }>['fieldIssues']>().toEqualTypeOf<
      Readonly<Partial<Record<'email' | 'fullName' | 'role', string>>> | undefined
    >();
    // @ts-expect-error -- unsupported error kinds cannot cross the application contract
    const invalid: UsersError = { kind: 'http', message: 'Failed' };
    expect(invalid.kind).toBe('http');
  });
});
