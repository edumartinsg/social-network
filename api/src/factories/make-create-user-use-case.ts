import { PrismaUserRepository } from '@/infraestructure/database/prisma-user-repository';
import { CreateUserUseCase } from '@/application/user/use-cases/create-user-use-case';
import { BcryptEncryptor } from '@/infraestructure/services/bcrypt';

export function makeCreateUserUseCase() {
  const usersRepository = new PrismaUserRepository()
  const encryptor = new BcryptEncryptor()
  const createUserUseCase = new CreateUserUseCase(usersRepository, encryptor)

  return createUserUseCase
}
