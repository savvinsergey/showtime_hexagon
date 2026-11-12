declare const fullNameBrand: unique symbol;

/**
 * Non-empty, trimmed full name retained as a serializable string.
 */
export type FullName = string & { readonly [fullNameBrand]: true };

export { parseFullName } from '../../services/users-domain/users-domain';
