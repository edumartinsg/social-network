import bcrypt from 'bcrypt';
import { Encryptor } from '@/domain/shared/interfaces/Encryptor';

// This class implements the Encryptor interface using bcrypt for hashing and comparing passwords.

export class BcryptEncryptor implements Encryptor {
  private readonly saltRounds = 10;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
