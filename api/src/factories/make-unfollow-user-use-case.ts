// make-unfollow-user-use-case.ts
import { UnfollowUserUseCase } from '@/application/follow/use-cases/unfollow-user-use-case'
import { PrismaFollowRepository } from '@/infraestructure/database/prisma-follow-repository'

export function makeUnfollowUserUseCase() {
  return new UnfollowUserUseCase(new PrismaFollowRepository())
}
