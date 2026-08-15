import { Entity } from '@/domain/shared/entity'
import { Result } from '@/domain/shared/result'

export interface FollowProps {
  followerId: string
  followingId: string
  createdAt: Date
}

export class Follow extends Entity<FollowProps> {
  private constructor(props: FollowProps) {
    super(props)
  }

  public static create(props: { followerId: string; followingId: string; createdAt?: Date }): Result<Follow> {
    if (props.followerId === props.followingId) {
      return Result.fail('A user cannot follow themselves')
    }

    return Result.ok(new Follow({
      followerId: props.followerId,
      followingId: props.followingId,
      createdAt: props.createdAt ?? new Date(),
    }))
  }

  get followerId(): string { return this.props.followerId }
  get followingId(): string { return this.props.followingId }
  get createdAt(): Date { return this.props.createdAt }
}
