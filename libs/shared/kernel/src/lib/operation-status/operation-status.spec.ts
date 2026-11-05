import type { OperationStatus } from './operation-status';

describe('OperationStatus', () => {
  it('requires an application error only for the error lifecycle variant', () => {
    expectTypeOf<OperationStatus<string>['status']>().toEqualTypeOf<
      'idle' | 'loading' | 'success' | 'error' | 'cancelled'
    >();
    // @ts-expect-error -- error status must carry the caller’s error
    const missingError: OperationStatus<string> = { status: 'error' };
    expect(missingError.status).toBe('error');
    const error: OperationStatus<string> = {
      status: 'error',
      error: 'Offline',
    };
    expect(error.error).toBe('Offline');
  });
});
