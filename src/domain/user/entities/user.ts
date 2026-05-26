import { Entity } from '@/domain/shared/entity';
import { UserId } from '../value-objects/userId';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { Result } from '@/domain/shared/result';

export interface UserProps {
  id: UserId;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date | null;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  public static create(props: {
    id: UserId;
    email: Email;
    password: Password;
    createdAt?: Date;
    updatedAt?: Date | null;
  }): Result<User> {
    const now = new Date();

    const user = new User({
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? null,
    });

    return Result.ok(user);
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }
}
