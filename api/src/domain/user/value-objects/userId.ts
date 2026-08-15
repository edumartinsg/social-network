import { Result } from "@/domain/shared/result";
import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly _value: string) {}

  public static create(id?: string): Result<UserId> {
    const finalId = id ?? randomUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(finalId)) {
      return Result.fail('Invalid UUID format');
    }
    return Result.ok(new UserId(finalId));
  }

  public equals(other: UserId): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  get value(): string {
    return this._value;
  }
}
