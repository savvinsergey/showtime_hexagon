import { err as failure, ok, type Result, type UseCaseAbstract } from '../../../index';

describe('UseCaseAbstract contracts', () => {
  type Input = Readonly<{ name: string }>;
  type Output = Readonly<{ greeting: string }>;
  type Failure = Readonly<{ reason: string }>;

  const useCase: UseCaseAbstract<Input, Output, Failure> = {
    execute: input =>
      Promise.resolve(
        input.name ? ok({ greeting: `Hello, ${input.name}` }) : failure({ reason: 'Missing name' }),
      ),
  };

  it('accepts the declared input and preserves output and error types', async () => {
    expectTypeOf<Parameters<typeof useCase.execute>>().toEqualTypeOf<[input: Input]>();
    const result = useCase.execute({ name: 'Ada' });
    expectTypeOf(result).toEqualTypeOf<Promise<Result<Output, Failure>>>();
    expect(await result).toEqual({ ok: true, value: { greeting: 'Hello, Ada' } });
    expect(await useCase.execute({ name: '' })).toEqual({
      ok: false,
      error: { reason: 'Missing name' },
    });
  });

  // Typecheck invalid calls without executing them.
  const invalidCalls = () => {
    // @ts-expect-error -- an arbitrary primitive is not the declared input
    useCase.execute(42);
    // @ts-expect-error -- the required name field cannot be omitted
    useCase.execute({});
    // @ts-expect-error -- the name field must be a string
    useCase.execute({ name: 42 });
    // @ts-expect-error -- this operation requires an input argument
    useCase.execute();
  };

  it('rejects arguments outside the declared input contract', () => {
    expectTypeOf(invalidCalls).toEqualTypeOf<() => void>();
  });
});
