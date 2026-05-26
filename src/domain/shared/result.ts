export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _error?: string;
  private readonly _value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  get error(): string {
    if (this.isSuccess) {
      throw new Error("Can't get error from a successful result");
    }
    return this._error!;
  }

  get value(): T {
    if (this.isFailure) {
      throw new Error("Can't get value from a failed result");
    }
    return this._value as T;
  }

  public static ok<U>(value: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, undefined);
  }

  // Helper for validating multiple Results at once
  public static combine(results: Result<any>[]): Result<any> {
    for (const r of results) {
      if (r.isFailure) return r;
    }
    return Result.ok(null);
  }
}
