import { signal, type Signal } from '@angular/core';
import { err as failure, ok, type OperationStatus as PureStatus, type Result } from '../../index';
import type { OperationStatus, UseCaseCall } from '../index';

describe('UseCaseCall contracts', () => {
  it('exposes status as a signal separately from a typed promised result', async () => {
    const call: UseCaseCall<number, string> = {
      status: signal<OperationStatus<string>>({ status: 'loading' }).asReadonly(),
      result: Promise.resolve(ok(42)),
    };

    expectTypeOf(call.status).toEqualTypeOf<Signal<OperationStatus<string>>>();
    expectTypeOf(call.result).toEqualTypeOf<Promise<Result<number, string>>>();
    expect(call.status()).toEqual({ status: 'loading' });
    expect(await call.result).toEqual({ ok: true, value: 42 });
  });

  it('Scenario: Generic errors stay with their consumer', async () => {
    type StockError = Readonly<{ missingUnits: number }>;
    type DeliveryError = 'unreachable';
    const shortage: StockError = { missingUnits: 3 };
    const stock: UseCaseCall<number, StockError> = {
      status: signal<OperationStatus<StockError>>({ status: 'error', error: shortage }),
      result: Promise.resolve(failure(shortage)),
    };
    const delivery: UseCaseCall<string, DeliveryError> = {
      status: signal<OperationStatus<DeliveryError>>({ status: 'error', error: 'unreachable' }),
      result: Promise.resolve(failure('unreachable' as const)),
    };

    expectTypeOf(stock.status).toEqualTypeOf<Signal<PureStatus<StockError>>>();
    expectTypeOf(delivery.status).toEqualTypeOf<Signal<PureStatus<DeliveryError>>>();
    expectTypeOf(stock.result).toEqualTypeOf<Promise<Result<number, StockError>>>();
    expectTypeOf(delivery.result).toEqualTypeOf<Promise<Result<string, DeliveryError>>>();
    expectTypeOf<
      Extract<PureStatus<StockError>, { status: 'error' }>['error']
    >().toEqualTypeOf<StockError>();
    expectTypeOf<
      Extract<PureStatus<DeliveryError>, { status: 'error' }>['error']
    >().toEqualTypeOf<DeliveryError>();
    expect(stock.status()).toEqual({ status: 'error', error: shortage });
    expect(await stock.result).toEqual({ ok: false, error: shortage });
    expect(delivery.status()).toEqual({ status: 'error', error: 'unreachable' });
    expect(await delivery.result).toEqual({ ok: false, error: 'unreachable' });
  });
});
