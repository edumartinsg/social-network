import { Result } from '@/domain/shared/result';

interface PasswordProps {
  value: string;
}

export class Password {
  private constructor(private readonly props: PasswordProps) {}

  public static create(password: string): Result<Password> {
    const trimmed = password.trim();

    if (trimmed.length < 8) {
      return Result.fail('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(trimmed)) {
      return Result.fail('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(trimmed)) {
      return Result.fail('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) {
      return Result.fail('Password must contain at least one special character');
    }

    return Result.ok(new Password({ value: trimmed }));
  }

  get value(): string {
    return this.props.value;
  }

  public equals(other: Password): boolean {
    if (!other) return false;
    return this.props.value === other.props.value;
  }
}
