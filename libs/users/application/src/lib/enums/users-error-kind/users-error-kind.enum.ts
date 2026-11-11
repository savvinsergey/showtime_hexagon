/**
 * Transport-independent failure kinds owned by the users application.
 */
export enum UsersErrorKindEnum {
  /**
   * Raw user input violates a structural validation rule.
   */
  Validation = 'validation',
  /**
   * The requested user does not exist.
   */
  NotFound = 'not-found',
  /**
   * Persistence rejected an operation because of a conflict.
   */
  Conflict = 'conflict',
  /**
   * The caller is not permitted to perform the operation.
   */
  Forbidden = 'forbidden',
  /**
   * Communication with persistence failed.
   */
  Network = 'network',
  /**
   * An unclassified failure may carry a diagnostic cause.
   */
  Unknown = 'unknown',
}
