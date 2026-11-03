import { signal, type Signal } from '@angular/core';
import { ok, type Result } from '@showtime/shared/kernel';
import type { OperationStatus } from '../operation-status/operation-status';
import type { UsersError } from '../users-error/users-error';
import type { UseCaseCall } from './use-case-call';

describe('UseCaseCall contracts', () => {
  it('exposes status as a signal separately from a typed promised result', async () => {
    const call: UseCaseCall<number> = {
      status: signal<OperationStatus>({ status: 'loading' }).asReadonly(),
      result: Promise.resolve(ok(42)),
    };

    expectTypeOf(call.status).toEqualTypeOf<Signal<OperationStatus>>();
    expectTypeOf(call.result).toEqualTypeOf<Promise<Result<number, UsersError>>>();
    expect(call.status()).toEqual({ status: 'loading' });
    expect(await call.result).toEqual({ ok: true, value: 42 });
  });

  it('requires an application error only for the error lifecycle variant', () => {
    expectTypeOf<OperationStatus['status']>().toEqualTypeOf<
      'idle' | 'loading' | 'success' | 'error' | 'cancelled'
    >();
    // @ts-expect-error -- error status must carry its UsersError
    const missingError: OperationStatus = { status: 'error' };
    expect(missingError.status).toBe('error');
    const error: OperationStatus = {
      status: 'error',
      error: { kind: 'network', message: 'Offline' },
    };
    expect(error.error.kind).toBe('network');
  });
});
