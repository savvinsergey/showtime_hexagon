import { parseFullName } from './full-name';

describe('FullName', () => {
  it('Scenario: Valid full name is accepted', () => {
    expect(parseFullName('Ada Lovelace')).toEqual({ ok: true, value: 'Ada Lovelace' });
  });

  it('trims surrounding whitespace while preserving the name', () => {
    expect(parseFullName('  Ada Lovelace\t')).toEqual({ ok: true, value: 'Ada Lovelace' });
  });

  it.each(['', '  \t\n'])('Scenario: Empty full name is rejected (%j)', raw => {
    expect(parseFullName(raw)).toMatchObject({ ok: false, error: { code: 'invalid-full-name' } });
  });
});
