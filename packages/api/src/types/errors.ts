export class ServiceError extends Error {
  public constructor(
    public override message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
