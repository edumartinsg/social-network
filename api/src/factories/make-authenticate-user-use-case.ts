import { PrismaUserRepository } from "@/infraestructure/database/prisma-user-repository"
import { AuthenticateUserUseCase } from  "@/application/user/use-cases/authenticate-user-use-case"
import { BcryptEncryptor } from '@/infraestructure/services/bcrypt';

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUserRepository()
  const encryptor = new BcryptEncryptor()
  const authenticateUseCase = new AuthenticateUserUseCase(usersRepository, encryptor)

  return authenticateUseCase
}
