/**
 * Source of the current time.
 *
 * Code that needs the time depends on this contract instead of reading `Date` directly, so tests can
 * substitute {@link fixedClock}. The DI token for it belongs to the application layer, not the kernel.
 */
export type Clock = Readonly<{
  /**
   * Returns the current time.
   *
   * @returns The time as an ISO-8601 string in UTC, for example `2026-01-31T10:15:30.000Z`.
   */
  now(): string;
}>;

/**
 * Clock backed by the real system time.
 */
export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

/**
 * Creates a clock that returns the same time on every call, for deterministic tests.
 *
 * @param iso The time to return, in the canonical UTC form produced by `Date.prototype.toISOString`
 *   (for example `2026-01-31T10:15:30.000Z`).
 * @returns A clock whose `now()` always returns `iso`.
 * @throws {RangeError} When `iso` is not a valid canonical ISO-8601 UTC string, so a broken fixture
 *   fails immediately instead of leaking an invalid time into the code under test.
 */
export function fixedClock(iso: string): Clock {
  if (Number.isNaN(Date.parse(iso)) || new Date(iso).toISOString() !== iso) {
    throw new RangeError(`fixedClock expects a canonical ISO-8601 UTC string, received "${iso}"`);
  }

  return { now: () => iso };
}
