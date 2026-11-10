import { OperationStatusEnum } from '../../../index';

describe('OperationStatusEnum', () => {
  it('exports exactly the five lowercase serialized lifecycle values', () => {
    expect(Object.values(OperationStatusEnum)).toEqual([
      'idle',
      'loading',
      'success',
      'error',
      'cancelled',
    ]);
    expect(JSON.stringify({ status: OperationStatusEnum.Cancelled })).toBe(
      '{"status":"cancelled"}',
    );
  });
});
