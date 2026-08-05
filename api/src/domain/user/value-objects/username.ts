import { Result } from "@/domain/shared/result";

export class UserName {
  private constructor(private readonly _value: string) {}

  public static create(username: string): Result<UserName> {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      return Result.fail('Username must be at least 2 characters long');
    }
    if (/\s/.test(trimmed)) {
      return Result.fail('Username cannot contain spaces');
    }
    return Result.ok(new UserName(trimmed));
  }

  public equals(other: UserName): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  get value(): string {
    return this._value;
  }
}
