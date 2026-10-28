import { fixedClock, systemClock } from './clock';

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('systemClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Scenario: system clock returns ISO time - reflects the controlled system time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T10:15:30.123Z'));

    const value = systemClock.now();

    expect(value).toMatch(ISO_PATTERN);
    expect(new Date(value).toISOString()).toBe(value);
    expect(value).toBe('2026-01-31T10:15:30.123Z');
  });

  it('Scenario: system clock returns ISO time - real time is a valid ISO-8601 string', () => {
    const value = systemClock.now();

    expect(value).toMatch(ISO_PATTERN);
    expect(new Date(value).toISOString()).toBe(value);
  });
});

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
