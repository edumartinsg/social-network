// RECONSTRUCTED: Result<T> class, used everywhere throughout the
// project but the exact file was never pasted. This reflects every
// usage pattern observed: Result.ok(), Result.fail(), .isFailure,
// .isSuccess, .value, .error. If your original implementation differs
// in method names, update call sites accordingly or adjust this file
// to match — the two are functionally equivalent based on usage.
export class Result<T> {
  public readonly isSuccess: boolean
  public readonly isFailure: boolean
  private readonly _error: string | null
  private readonly _value: T | null

  private constructor(isSuccess: boolean, error: string | null, value: T | null) {
    this.isSuccess = isSuccess
    this.isFailure = !isSuccess
    this._error = error
    this._value = value
  }

  public static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value)
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null)
  }

  get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed result.')
    }
    return this._value as T
  }

  // alias, in case any call site uses getValue() instead of .value
  public getValue(): T {
    return this.value
  }

  get error(): string {
    return this._error ?? ''
  }
}
