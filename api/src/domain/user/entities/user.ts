import { Entity } from '@/domain/shared/entity';
import { Result } from '@/domain/shared/result';
import { Age } from '../value-objects/age';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { UserId } from '../value-objects/userId';
import { UserName } from '../value-objects/username';

export interface UserProps {
  id: UserId;
  email: Email;
  name?: string;
  avatarUrl?: string | null;
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
    avatarUrl?: string | null;
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
      avatarUrl: props.avatarUrl ?? null,
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

  public changeAvatar(newAvatarUrl: string): void {
  this.props.avatarUrl = newAvatarUrl
  this.props.updatedAt = new Date()
}

  public delete(): void {
    this.props.deletedAt = new Date();
  }

  get id(): UserId {
    return this.props.id;
  }


  get avatarUrl(): string | null {
    return this.props.avatarUrl ?? null;
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
