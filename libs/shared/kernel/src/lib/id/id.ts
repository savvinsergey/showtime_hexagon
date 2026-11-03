declare const brandSymbol: unique symbol;

/**
 * Identifier of an entity, branded so ids of different entities are not interchangeable.
 *
 * The brand exists only at compile time: at runtime an `Id` is a plain string, so it serializes to
 * the same string with no wrapper. Create one with a cast at a trusted boundary (for example when
 * mapping a backend response), then pass it around typed: `const userId = raw as Id<'User'>`.
 *
 * @typeParam Brand Unique name of the entity the id belongs to, for example `'User'`.
 */
export type Id<Brand extends string> = string & { readonly [brandSymbol]: Brand };
