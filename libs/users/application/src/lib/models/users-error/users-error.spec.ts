import { ErrorKindEnum } from '@showtime/shared/kernel';
import type { UsersError } from './users-error';

describe('UsersError', () => {
  const errors: readonly UsersError[] = [
    {
      kind: ErrorKindEnum.Validation,
      message: 'Invalid',
      fieldIssues: { email: 'Email', fullName: 'Name', role: 'Role' },
    },
    { kind: ErrorKindEnum.NotFound, message: 'Missing' },
    { kind: ErrorKindEnum.Conflict, message: 'Conflict' },
    { kind: ErrorKindEnum.Forbidden, message: 'Forbidden' },
    { kind: ErrorKindEnum.Network, message: 'Offline' },
    { kind: ErrorKindEnum.Unknown, message: 'Failed', cause: { diagnostic: 'failure' } },
  ];

  it('Scenario: Enum members construct all error variants', () => {
    expect(errors.map(error => error.kind)).toEqual(Object.values(ErrorKindEnum));
    expectTypeOf<UsersError['kind']>().toEqualTypeOf<ErrorKindEnum>();
  });

  it('Scenario: Validation narrowing retains field issues', () => {
    const error: UsersError = errors[0];
    if (error.kind !== ErrorKindEnum.Validation) return expect.unreachable();
    expectTypeOf(error.fieldIssues).toEqualTypeOf<
      Readonly<Partial<Record<'email' | 'fullName' | 'role', string>>> | undefined
    >();
    expect(error.fieldIssues).toEqual({ email: 'Email', fullName: 'Name', role: 'Role' });
    // @ts-expect-error -- validation errors do not expose diagnostic causes
    expectTypeOf(error.cause);
  });

  it('Scenario: Unknown narrowing retains optional cause', () => {
    const error: UsersError = errors[5];
    if (error.kind !== ErrorKindEnum.Unknown) return expect.unreachable();
    expectTypeOf(error.cause).toEqualTypeOf<unknown>();
    expect(error.cause).toEqual({ diagnostic: 'failure' });
    const withoutCause: UsersError = { kind: ErrorKindEnum.Unknown, message: 'Failed' };
    expect(withoutCause.cause).toBeUndefined();
    // @ts-expect-error -- unknown errors do not expose validation fields
    expectTypeOf(error.fieldIssues);
  });

  it('Scenario: Unsupported and raw kinds are rejected', () => {
    // @ts-expect-error -- unsupported error kinds cannot cross the contract
    const unsupported: UsersError = { kind: 'http', message: 'Failed' };
    // @ts-expect-error -- empty error kinds cannot cross the contract
    const empty: UsersError = { kind: '', message: 'Failed' };
    // @ts-expect-error -- supported raw strings must use enum members
    const raw: UsersError = { kind: 'validation', message: 'Failed' };
    expect([unsupported.kind, empty.kind, raw.kind]).toEqual(['http', '', 'validation']);
  });

  it('Scenario: Error serialization is unchanged', () => {
    const serialized = JSON.stringify(errors);
    expect(JSON.parse(serialized)).toEqual([
      {
        kind: 'validation',
        message: 'Invalid',
        fieldIssues: { email: 'Email', fullName: 'Name', role: 'Role' },
      },
      { kind: 'not-found', message: 'Missing' },
      { kind: 'conflict', message: 'Conflict' },
      { kind: 'forbidden', message: 'Forbidden' },
      { kind: 'network', message: 'Offline' },
      { kind: 'unknown', message: 'Failed', cause: { diagnostic: 'failure' } },
    ]);
  });
});
