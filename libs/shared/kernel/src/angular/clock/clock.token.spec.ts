import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fixedClock, systemClock } from '../../index';
import { CLOCK } from '../index';

describe('CLOCK', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('Scenario: System clock is the default', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const clock = TestBed.inject(CLOCK);
    expect(clock).toBe(systemClock);
    const value = clock.now();

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(value).toISOString()).toBe(value);
  });

  it('Scenario: Tests can fix the clock', () => {
    const timestamp = '2026-01-31T10:15:30.000Z';
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: CLOCK, useValue: fixedClock(timestamp) },
      ],
    });

    const clock = TestBed.inject(CLOCK);

    expect(clock.now()).toBe(timestamp);
    expect(clock.now()).toBe(timestamp);
    expect(clock.now()).toBe(timestamp);
  });
});
