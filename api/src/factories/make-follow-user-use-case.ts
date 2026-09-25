// make-follow-user-use-case.ts
import { FollowUserUseCase } from '@/application/follow/use-cases/follow-user-use-case'
import { PrismaFollowRepository } from '@/infrastructure/database/prisma-follow-repository'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'

export function makeFollowUserUseCase() {
  return new FollowUserUseCase(new PrismaFollowRepository(), new PrismaUserRepository())
}
