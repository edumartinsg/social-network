import { UpdateUserAvatarUseCase } from '@/application/user/use-cases/update-user-avatar-use-case'
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user-repository'
import { S3Storage } from '@/infrastructure/services/s3-storage'

export function makeUpdateUserAvatarUseCase() {
  const userRepository = new PrismaUserRepository()
  const fileStorage = new S3Storage()
  return new UpdateUserAvatarUseCase(userRepository, fileStorage)
}
