import { Result } from '@/domain/shared/result'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'

interface GetUserByIdUseCaseRequest {
  userId: string
}

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userId }: GetUserByIdUseCaseRequest): Promise<Result<User>> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return Result.fail('User not found')
    }

    return Result.ok(user)
  }
}
