import { Result } from "../../shared/result";

export class Age {
  private constructor(private readonly _value: number) {}

  public static create(raw: number): Result<Age> {
    if (raw === undefined || raw === null) {
      return Result.fail('Age is required');
    }

    if (raw < 0) {
      return Result.fail('Age must be a positive number');
    }

    if(raw < 18) {
        return Result.fail('User must be at least 18 years old');
    }
    return Result.ok(new Age(raw));
  }

  get value(): number {
    return this._value;
  }
};
