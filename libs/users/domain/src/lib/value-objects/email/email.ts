declare const emailBrand: unique symbol;

/**
 * Structurally validated email; its brand adds no runtime wrapper.
 */
export type Email = string & { readonly [emailBrand]: true };

export { parseEmail } from '../../services/users-domain/users-domain';
