import { fixedClock } from './clock';

describe('fixedClock', () => {
  it('Scenario: fixed clock returns a constant - every call returns the configured time', () => {
    const clock = fixedClock('2026-01-31T10:15:30.000Z');

    expect(clock.now()).toBe('2026-01-31T10:15:30.000Z');
    expect(clock.now()).toBe('2026-01-31T10:15:30.000Z');
    expect(clock.now()).toBe('2026-01-31T10:15:30.000Z');
  });

  it('keeps returning the configured time while real time passes', () => {
    vi.useFakeTimers();
    try {
      const clock = fixedClock('2026-01-31T10:15:30.000Z');

      vi.advanceTimersByTime(60_000);

      expect(clock.now()).toBe('2026-01-31T10:15:30.000Z');
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    '',
    'not-a-date',
    '2026-01-31',
    '2026-01-31T10:15:30Z',
    '2026-01-31T10:15:30.000+03:00',
    '2026-01-31T12:00:00.000+03:00',
    '2026-02-30T00:00:00.000Z',
  ])('rejects "%s" because it is not a canonical ISO-8601 UTC string', value => {
    expect(() => fixedClock(value)).toThrow(RangeError);
  });
});
