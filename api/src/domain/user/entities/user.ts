import { Entity } from '@/domain/shared/entity';
import { UserId } from '../value-objects/userId';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { Result } from '@/domain/shared/result';
import { UserName } from '../value-objects/username';
import { Age } from '../value-objects/age';

export interface UserProps {
  id: UserId;
  email: Email;
  name?: string;
  username: UserName;
  age: Age;
  password: Password;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt?: Date | null;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  public static create(props: {
    id: UserId;
    name?: string;
    email: Email;
    age: Age;
    username: UserName;
    password: Password;
    createdAt?: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
  }): Result<User> {
    const now = new Date();

    const user = new User({
      ...props,
      age: props.age,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      username: props.username,
    });

    return Result.ok(user);
  }

  public equals(other: User): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  public updateEmail(newEmail: Email): void {
    this.props.email = newEmail;
    this.props.updatedAt = new Date();
  }

  public updatePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.deletedAt = new Date();
  }

  get id(): UserId {
    return this.props.id;
  }

  get username(): UserName {
    return this.props.username;
  }

  get age(): Age {
    return this.props.age;
  }

  get name(): string | undefined {
    return this.props.name;
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

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }
}
