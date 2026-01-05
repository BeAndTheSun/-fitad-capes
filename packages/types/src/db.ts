export class DbError extends Error {}

export enum DbErrorCode {
  FailedDataInsertion = 'failed-data-insertion',
}
