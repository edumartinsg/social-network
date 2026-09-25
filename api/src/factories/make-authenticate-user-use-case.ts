import { AuthenticateUserUseCase } from "@/application/user/use-cases/authenticate-user-use-case";
import { PrismaUserRepository } from "@/infrastructure/database/prisma-user-repository";
import { BcryptEncryptor } from '@/infrastructure/services/bcrypt';

export function makeAuthenticateUserUseCase() {
  const usersRepository = new PrismaUserRepository()
  const encryptor = new BcryptEncryptor()
  const authenticateUseCase = new AuthenticateUserUseCase(usersRepository, encryptor)

  return authenticateUseCase
}
