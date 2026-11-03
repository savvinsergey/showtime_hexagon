import { parseEmail } from './email';

describe('Email', () => {
  it('Scenario: Valid email is accepted', () => {
    expect(parseEmail('ada@example.com')).toEqual({ ok: true, value: 'ada@example.com' });
  });

  it('trims surrounding whitespace without changing the address', () => {
    expect(parseEmail('  ada@example.com\t')).toEqual({ ok: true, value: 'ada@example.com' });
  });

  it.each(['', '  \t\n'])('Scenario: Empty email is rejected (%j)', raw => {
    expect(parseEmail(raw)).toMatchObject({ ok: false, error: { code: 'invalid-email' } });
  });

  it('Scenario: Email without at-sign is rejected', () => {
    expect(parseEmail('not-an-email')).toMatchObject({
      ok: false,
      error: { code: 'invalid-email' },
    });
  });

  it.each(['ada@', '@example.com', 'ada@@example.com', 'ada@exam ple.com'])(
    'rejects an incomplete or malformed email (%j)',
    raw => {
      expect(parseEmail(raw)).toMatchObject({ ok: false, error: { code: 'invalid-email' } });
    },
  );
});
