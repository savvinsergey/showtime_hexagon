/**
 * Transport-independent failure categories shared without prescribing error payloads.
 */
export enum ErrorKindEnum {
  /**
   * Input violates a structural validation rule.
   */
  Validation = 'validation',
  /**
   * The requested resource does not exist.
   */
  NotFound = 'not-found',
  /**
   * The operation was rejected because of a conflict.
   */
  Conflict = 'conflict',
  /**
   * The caller is not permitted to perform the operation.
   */
  Forbidden = 'forbidden',
  /**
   * Communication with an external system failed.
   */
  Network = 'network',
  /**
   * The failure has no more specific classification.
   */
  Unknown = 'unknown',
}
