import { IEncryptor } from '@/domain/shared/interfaces/encryptor';
import { Result } from '@/domain/shared/result';

export class Password {
  private constructor(
    private readonly _value: string,
    private readonly _isHashed: boolean = false  // track whether already hashed
  ) {}

  // validates complexity -- use when receiving plain password from user input
  public static create(password: string): Result<Password> {
    const trimmed = password.trim()

    if (trimmed.length < 8) {
      return Result.fail('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(trimmed)) {
      return Result.fail('Password must contain at least one uppercase letter')
    }
    if (!/[0-9]/.test(trimmed)) {
      return Result.fail('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) {
      return Result.fail('Password must contain at least one special character')
    }

    return Result.ok(new Password(trimmed, false))
  }

  // skips validation -- use when rebuilding from DB where password is already hashed
  public static createHashed(hash: string): Result<Password> {
    if (!hash || hash.trim().length === 0) {
      return Result.fail('Hashed password cannot be empty')
    }
    return Result.ok(new Password(hash, true))
  }

  // hashes the plain password -- only call on unhashed passwords
  public async hash(encryptor: IEncryptor): Promise<Password> {
    const hashed = await encryptor.hash(this._value)
    return new Password(hashed, true)
  }

  // compares plain text against this hashed password
  public async compare(plain: string, encryptor: IEncryptor): Promise<boolean> {
    return encryptor.compare(plain, this._value)
  }

  public isHashed(): boolean {
    return this._isHashed
  }

  get value(): string {
    return this._value
  }

  public equals(other: Password): boolean {
    if (!other) return false
    return this._value === other._value
  }
}
