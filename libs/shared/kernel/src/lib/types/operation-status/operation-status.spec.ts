import { OperationStatusEnum } from '../../../index';
import type { OperationStatus } from './operation-status';

describe('OperationStatus', () => {
  it('requires an application error only for the error lifecycle variant', () => {
    expectTypeOf<OperationStatus<string>['status']>().toEqualTypeOf<OperationStatusEnum>();
    // @ts-expect-error -- error status must carry the caller’s error
    const missingError: OperationStatus<string> = { status: OperationStatusEnum.Error };
    expect(missingError.status).toBe('error');
    // @ts-expect-error -- callers must use the shared enum rather than raw lifecycle strings
    const rawStatus: OperationStatus<string> = { status: 'loading' };
    expect(rawStatus.status).toBe('loading');
    const error: OperationStatus<string> = {
      status: OperationStatusEnum.Error,
      error: 'Offline',
    };
    expect(error.error).toBe('Offline');
    expectTypeOf<
      Extract<OperationStatus<string>, { status: OperationStatusEnum.Error }>['error']
    >().toEqualTypeOf<string>();
  });

  it('narrows the error payload by the enum discriminant', () => {
    const statuses: OperationStatus<{ reason: string }>[] = [
      { status: OperationStatusEnum.Idle },
      { status: OperationStatusEnum.Loading },
      { status: OperationStatusEnum.Success },
      { status: OperationStatusEnum.Error, error: { reason: 'Offline' } },
      { status: OperationStatusEnum.Cancelled },
    ];
    for (const status of statuses) {
      if (status.status === OperationStatusEnum.Error) {
        expectTypeOf(status.error).toEqualTypeOf<{ reason: string }>();
        expect(status.error.reason).toBe('Offline');
      } else {
        // @ts-expect-error -- other lifecycle variants have no error payload
        expect(status.error).toBeUndefined();
      }
    }
  });
});
