import { UserRepository } from "@/domain/user/repositories/UserRepository"
import { Encryptor } from "@/domain/shared/interfaces/Encryptor"
import { User } from "@/domain/user/entities/user"
import { Result } from "@/domain/shared/result"

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Result<User>

export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UserRepository,
    private encryptor: Encryptor
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {

    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return Result.fail('Invalid credentials')
    }

    const doesPasswordMatch = await this.encryptor.compare(
      password,
      user.password.value
    )

    if (!doesPasswordMatch) {
      return Result.fail('Invalid credentials')
    }

    return Result.ok(user)
  }
}