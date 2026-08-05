import { Result } from "../../shared/result";

export class Email {
  private constructor(private readonly _value: string) {}

  public static create(raw: string): Result<Email> {
    if (!raw) {
      return Result.fail('Email is required');
    }

    const email = raw.trim().toLowerCase();

    if (!email.length) {
      return Result.fail('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Result.fail('Email format is invalid');
    }

    return Result.ok(new Email(email));
  }

  get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}
