import { InjectionToken } from '@angular/core';
import { systemClock, type Clock } from '../../lib/clock/clock';

/**
 * Application time source; domain operations receive its timestamp explicitly.
 * Defaults to real UTC time and can be overridden with a fixed clock in tests.
 */
export const CLOCK = new InjectionToken<Clock>('CLOCK', {
  providedIn: 'root',
  factory: () => systemClock,
});
