import { domainError, type DomainError } from './domain-error';

describe('DomainError', () => {
  it('has exactly the code and message keys, both strings', () => {
    const error = domainError('users.not-found', 'User was not found');

    expect(Object.keys(error)).toEqual(['code', 'message']);
    expect(typeof error.code).toBe('string');
    expect(typeof error.message).toBe('string');
    expect(error).toEqual({ code: 'users.not-found', message: 'User was not found' });
  });

  it('returns a fresh plain object on every call', () => {
    const first = domainError('users.not-found', 'User was not found');
    const second = domainError('users.not-found', 'User was not found');

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
    expect(Object.getPrototypeOf(first)).toBe(Object.prototype);
  });

  it('is plain data that survives a JSON round trip with exactly code and message', () => {
    const error = domainError('users.invalid-email', 'Email is invalid');

    // eslint-disable-next-line unicorn/prefer-structured-clone -- the JSON round trip is the behavior under test
    const restored = JSON.parse(JSON.stringify(error)) as DomainError;

    expect(Object.keys(restored)).toEqual(['code', 'message']);
    expect(restored).toEqual(error);
  });
});
