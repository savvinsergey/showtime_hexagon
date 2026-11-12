import { OperationStatusEnum, completedStatus, err as failure, ok } from '../../../index';
import type { OperationStatus, Result } from '../../../index';

describe('completedStatus', () => {
  it('maps a successful result to Success without exposing the result value', () => {
    const outcome = ok({ id: 'item-1' });

    expect(completedStatus(outcome)).toEqual({ status: OperationStatusEnum.Success });
    expect(outcome).toEqual({ ok: true, value: { id: 'item-1' } });
  });

  it('maps a failed result to Error with the original error payload', () => {
    const error = Object.freeze({ reason: 'unavailable' });
    const outcome = Object.freeze(failure(error));
    const status = completedStatus(outcome);

    expect(status).toEqual({ status: OperationStatusEnum.Error, error });
    if (status.status !== OperationStatusEnum.Error) return expect.unreachable();
    expect(status.error).toBe(error);
    expect(outcome.error).toBe(error);
  });

  it('preserves unrelated consumer error types', () => {
    type StockError = Readonly<{ missingUnits: number }>;
    type DeliveryError = 'unreachable';
    const stock: Result<number, StockError> = failure({ missingUnits: 3 });
    const delivery: Result<string, DeliveryError> = failure('unreachable');
    const stockStatus = completedStatus(stock);
    const deliveryStatus = completedStatus(delivery);

    expectTypeOf(stockStatus).toEqualTypeOf<OperationStatus<StockError>>();
    expectTypeOf(deliveryStatus).toEqualTypeOf<OperationStatus<DeliveryError>>();
    expect(stockStatus).toEqual({
      status: OperationStatusEnum.Error,
      error: { missingUnits: 3 },
    });
    expect(deliveryStatus).toEqual({
      status: OperationStatusEnum.Error,
      error: 'unreachable',
    });
  });
});
