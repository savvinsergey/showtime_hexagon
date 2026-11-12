import { ErrorKindEnum } from '../../../index';

describe('ErrorKindEnum', () => {
  it('Shared error kinds retain their values', () => {
    expect(ErrorKindEnum).toEqual({
      Validation: 'validation',
      NotFound: 'not-found',
      Conflict: 'conflict',
      Forbidden: 'forbidden',
      Network: 'network',
      Unknown: 'unknown',
    });
    expect(JSON.stringify(Object.values(ErrorKindEnum))).toBe(
      '["validation","not-found","conflict","forbidden","network","unknown"]',
    );
  });

  it('Unrelated callers share the classification', () => {
    type DocumentError = Readonly<{
      kind: ErrorKindEnum.NotFound;
      documentPath: string;
    }>;
    type PaymentError = Readonly<{
      kind: ErrorKindEnum.Conflict;
      transactionId: number;
    }>;
    const documentError: DocumentError = {
      kind: ErrorKindEnum.NotFound,
      documentPath: '/report',
    };
    const paymentError: PaymentError = {
      kind: ErrorKindEnum.Conflict,
      transactionId: 42,
    };
    expectTypeOf(documentError.kind).toEqualTypeOf<ErrorKindEnum.NotFound>();
    expectTypeOf(paymentError.kind).toEqualTypeOf<ErrorKindEnum.Conflict>();
    expectTypeOf<DocumentError>().not.toExtend<PaymentError>();
    expectTypeOf<PaymentError>().not.toExtend<DocumentError>();
    expect(documentError.documentPath).toBe('/report');
    expect(paymentError.transactionId).toBe(42);
  });
});
