import { IEncryptor } from '@/domain/shared/interfaces/encryptor'
import { Result } from '@/domain/shared/result'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'
import { Email } from '@/domain/user/value-objects/email'

interface AuthenticateUserUseCaseRequest {
  identifier: string
  password: string
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptor: IEncryptor,
  ) {}

  async execute({
    identifier,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<Result<User>> {
    // A single generic failure covers every branch below on purpose. Whether
    // the identifier looked like an email, resolved to no user, or resolved
    // to a user whose password did not match, the caller learns none of it.
    // Email/username login doubles the surface OWASP A07 warns about: a
    // distinct message per branch would let an attacker probe both which
    // emails and which usernames exist on the platform.
    const invalidCredentials = Result.fail<User>('Invalid credentials')

    const user = await this.resolveUser(identifier)
    if (!user) return invalidCredentials

    const passwordMatches = await this.encryptor.compare(
      password,
      user.password.value,
    )
    if (!passwordMatches) return invalidCredentials

    return Result.ok(user)
  }

  // The identifier's shape, not a client-supplied flag, decides which
  // repository lookup runs. That is what keeps this safe: nothing in the
  // request can force the wrong branch, because there is no branch selector
  // in the request at all.
  private resolveUser(identifier: string) {
    const emailResult = Email.create(identifier)

    return emailResult.isSuccess
      ? this.userRepository.findByEmail(emailResult.value.value)
      : this.userRepository.findByUsername(identifier)
  }
}
