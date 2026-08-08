import { FollowRepository } from "@/application/follow/repositories/FollowRepository"
import { Result } from "@/domain/shared/result"

interface UnfollowUserUseCaseRequest {
  followerId: string
  followingId: string
}

export class UnfollowUserUseCase {
  constructor(private followRepository: FollowRepository) {}

  public async execute(request: UnfollowUserUseCaseRequest): Promise<Result<void>> {

    const exists = await this.followRepository.exists(
      request.followerId,
      request.followingId
    )
    if (!exists) return Result.fail('Not following this user')

    await this.followRepository.delete(request.followerId, request.followingId)

    return Result.ok(undefined)
  }
}
