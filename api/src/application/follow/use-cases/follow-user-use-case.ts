import { Follow } from "@/application/follow/entities/follow"
import { FollowRepository } from "@/domain/follow/repositories/follow-repository"
import { Result } from "@/domain/shared/result"
import { UserRepository } from "@/domain/user/repositories/user-repository"

interface FollowUserUseCaseRequest {
  followerId: string
  followingId: string
}

export class FollowUserUseCase {
  constructor(
    private followRepository: FollowRepository,
    private userRepository: UserRepository
  ) {}

  public async execute(request: FollowUserUseCaseRequest): Promise<Result<void>> {

    const followOrError = Follow.create(request)
    if (followOrError.isFailure) return Result.fail(followOrError.error)

    const targetUser = await this.userRepository.findById(request.followingId)
    if (!targetUser) return Result.fail('User not found')

    const alreadyFollowing = await this.followRepository.exists(
      request.followerId,
      request.followingId
    )
    if (alreadyFollowing) return Result.fail('Already following this user')

    await this.followRepository.create(followOrError.value)

    return Result.ok(undefined)
  }
}
