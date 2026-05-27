import { Entity } from '@/domain/shared/entity';
import { IEncryptor } from '@/domain/shared/interfaces/IEncryptor';
import { Result } from '@/domain/shared/result';


export class Password{
  private constructor(private readonly _value: string) {}

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

    return Result.ok(new Password(trimmed));
  }


public async toHash(encryptor: IEncryptor): Promise<Password> {
  const hashed = await encryptor.hash(this._value)
  return new Password(hashed)
}

public async compare(plain: string, encryptor: IEncryptor): Promise<boolean> {
  return encryptor.compare(plain, this._value)
}


  get value(): string {
    return this._value;
  }

  public equals(other: Password): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

}



