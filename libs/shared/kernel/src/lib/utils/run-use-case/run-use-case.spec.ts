import type { Signal } from '@angular/core';
import { OperationStatusEnum } from '../../enums/operation-status/operation-status.enum';
import type { OperationStatus } from '../../types/operation-status/operation-status';
import { err as failure, ok, type Result } from '../../types/result/result';
import { runUseCase } from './run-use-case';

function controlled<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  // eslint-disable-next-line unicorn/prefer-promise-with-resolvers -- The workspace targets ES2022, before Promise.withResolvers.
  const promise = new Promise<T>((fulfill, fail) => {
    resolve = fulfill;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe('runUseCase', () => {
  it('Runner succeeds with the original result', async () => {
    const operation = controlled<Result<{ id: number }, string>>();
    const execute = vi.fn(() => operation.promise);
    const call = runUseCase(execute);
    expect(execute).toHaveBeenCalledExactlyOnceWith();
    expect(call.status()).toEqual({ status: OperationStatusEnum.Loading });
    expectTypeOf(call.status).toEqualTypeOf<Signal<OperationStatus<string>>>();
    expectTypeOf(call.status).not.toHaveProperty('set');
    expectTypeOf(call.status).not.toHaveProperty('update');
    expect('set' in call.status).toBe(false);
    expect('update' in call.status).toBe(false);
    const outcome = ok({ id: 1 });
    operation.resolve(outcome);
    expect(await call.result).toBe(outcome);
    expect(call.status()).toEqual({ status: OperationStatusEnum.Success });
  });

  it('Runner preserves typed errors', async () => {
    type StockError = Readonly<{ missingUnits: number }>;
    type DeliveryError = 'unreachable';
    const stock = controlled<Result<number, StockError>>();
    const delivery = controlled<Result<string, DeliveryError>>();
    const stockCall = runUseCase(() => stock.promise);
    const deliveryCall = runUseCase(() => delivery.promise);
    expectTypeOf(stockCall.result).toEqualTypeOf<Promise<Result<number, StockError>>>();
    expectTypeOf(deliveryCall.result).toEqualTypeOf<Promise<Result<string, DeliveryError>>>();
    expectTypeOf(stockCall.status).toEqualTypeOf<Signal<OperationStatus<StockError>>>();
    expectTypeOf(deliveryCall.status).toEqualTypeOf<Signal<OperationStatus<DeliveryError>>>();
    const error: StockError = { missingUnits: 3 };
    const stockResult = failure(error);
    const deliveryResult = failure('unreachable' as const);
    stock.resolve(stockResult);
    delivery.resolve(deliveryResult);
    expect(await stockCall.result).toBe(stockResult);
    expect(await deliveryCall.result).toBe(deliveryResult);
    const status = stockCall.status();
    expect(status.status).toBe(OperationStatusEnum.Error);
    if (status.status !== OperationStatusEnum.Error) throw new Error('Expected Error status');
    expectTypeOf(status.error).toEqualTypeOf<StockError>();
    expect(status.error).toBe(error);
    expect(deliveryCall.status()).toEqual({
      status: OperationStatusEnum.Error,
      error: 'unreachable',
    });
  });

  it('Concurrent calls stay independent', async () => {
    const first = controlled<Result<number, string>>();
    const second = controlled<Result<number, string>>();
    const firstCall = runUseCase(() => first.promise);
    const secondCall = runUseCase(() => second.promise);
    expect(firstCall.status).not.toBe(secondCall.status);
    const secondResult = failure('second');
    second.resolve(secondResult);
    expect(await secondCall.result).toBe(secondResult);
    expect(firstCall.status()).toEqual({ status: OperationStatusEnum.Loading });
    const firstResult = ok(1);
    first.resolve(firstResult);
    expect(await firstCall.result).toBe(firstResult);
    expect(firstCall.status()).toEqual({ status: OperationStatusEnum.Success });
    expect(secondCall.status()).toEqual({ status: OperationStatusEnum.Error, error: 'second' });
    expect(await secondCall.result).toBe(secondResult);
  });

  it('Hook observes success before result delivery', async () => {
    const operation = controlled<Result<object, string>>();
    const background = controlled<void>();
    const order: string[] = [];
    const hook = vi.fn((value: object) => {
      expect(call.status()).toEqual({ status: OperationStatusEnum.Success });
      expect(value).toBe(outcome.value);
      order.push('hook');
      return background.promise;
    });
    const call = runUseCase(() => operation.promise, hook);
    const outcome = ok({ id: 1 });
    const delivered = (async () => {
      const result = await call.result;
      order.push('result');
      return result;
    })();
    operation.resolve(outcome);
    expect(await delivered).toBe(outcome);
    expect(hook).toHaveBeenCalledExactlyOnceWith(outcome.value);
    expect(order).toEqual(['hook', 'result']);
    background.resolve(undefined);
  });

  it('Failed operation skips hook', async () => {
    const operation = controlled<Result<number, string>>();
    const hook = vi.fn();
    const call = runUseCase(() => operation.promise, hook);
    const outcome = failure('failed');
    operation.resolve(outcome);
    expect(await call.result).toBe(outcome);
    expect(hook).not.toHaveBeenCalled();
    expect(call.status()).toEqual({ status: OperationStatusEnum.Error, error: outcome.error });
  });

  it('Unexpected exceptions retain existing semantics: synchronous execution throw', async () => {
    const exception = new Error('execute');
    const hook = vi.fn();
    const call = runUseCase(() => {
      throw exception;
    }, hook);
    await expect(call.result).rejects.toBe(exception);
    expect(call.status()).toEqual({ status: OperationStatusEnum.Loading });
    expect(hook).not.toHaveBeenCalled();
  });

  it('Unexpected exceptions retain existing semantics: execution rejection', async () => {
    const operation = controlled<Result<number, string>>();
    const hook = vi.fn();
    const call = runUseCase(() => operation.promise, hook);
    const exception = { reason: 'rejected' };
    const rejected = expect(call.result).rejects.toBe(exception);
    operation.reject(exception);
    await rejected;
    expect(call.status()).toEqual({ status: OperationStatusEnum.Loading });
    expect(hook).not.toHaveBeenCalled();
  });

  it('Unexpected exceptions retain existing semantics: synchronous hook throw', async () => {
    const operation = controlled<Result<number, string>>();
    const exception = new Error('hook');
    const hook = vi.fn(() => {
      throw exception;
    });
    const call = runUseCase(() => operation.promise, hook);
    const rejected = expect(call.result).rejects.toBe(exception);
    operation.resolve(ok(1));
    await rejected;
    expect(call.status()).toEqual({ status: OperationStatusEnum.Success });
    expect(hook).toHaveBeenCalledExactlyOnceWith(1);
  });
});
