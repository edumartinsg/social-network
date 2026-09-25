import { GetUserByIdUseCase } from '@/application/user/use-cases/get-user-by-id-use-case'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'

export function makeGetUserByIdUseCase() {
  const userRepository = new PrismaUserRepository()
  return new GetUserByIdUseCase(userRepository)
}
