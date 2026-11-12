import { systemClock } from './clock';

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
