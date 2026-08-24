import { SearchUsersUseCase } from '@/application/user/use-cases/search-user-use-case'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'

export function makeSearchUsersUseCase() {
  const userRepository = new PrismaUserRepository()
  return new SearchUsersUseCase(userRepository)
}
