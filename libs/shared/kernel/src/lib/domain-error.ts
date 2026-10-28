/**
 * Stable shape of a domain error.
 *
 * Contexts define their own errors on top of it (for example by narrowing `code` to a union of
 * literals). It is plain data, so it can be serialized and compared structurally.
 */
export type DomainError = Readonly<{
  /**
   * Machine-readable error code, stable across releases; used for branching and translations.
   */
  code: string;
  /**
   * Human-readable description of what went wrong.
   */
  message: string;
}>;

/**
 * Creates a domain error.
 *
 * @param code Machine-readable error code.
 * @param message Human-readable description.
 * @returns A plain `DomainError` exposing both values unchanged.
 */
export function domainError(code: string, message: string): DomainError {
  return { code, message };
}
