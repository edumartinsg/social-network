
import { FileStorage } from '@/domain/shared/interfaces/file-storage'
import { Result } from '@/domain/shared/result'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'

interface UpdateUserAvatarUseCaseRequest {
  userId: string
  file: Buffer
  mimeType: string
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

export class UpdateUserAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  // Avatars deliberately skip the BullMQ upload queue that post images go
  // through (Challenge 11). That queue exists because a slow upload should
  // never block the HTTP thread during a burst of post creation traffic.
  // An avatar change is one small file on a low-frequency path with no
  // comparable contention risk, so the async round trip (enqueue, poll for
  // jobId, wait on a worker) would add latency without solving a real
  // problem. Revisit this if avatar uploads ever become high-frequency.
  //
  // Integration note: requires User to expose an avatarUrl field and a
  // changeAvatar() method, the same "entity owns its own state transitions"
  // pattern Post already uses for edit()/delete().
  async execute({
    userId,
    file,
    mimeType,
  }: UpdateUserAvatarUseCaseRequest): Promise<Result<User>> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return Result.fail<User>('Unsupported image format')
    }

    if (file.byteLength > MAX_AVATAR_SIZE_BYTES) {
      return Result.fail<User>('Image exceeds the 5MB limit')
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      return Result.fail<User>('User not found')
    }

    const avatarUrl = await this.fileStorage.upload({
      buffer: file,
      fileName: `avatars/${userId}`,
      contentType: mimeType,
    })

    user.changeAvatar(avatarUrl)
    await this.userRepository.save(user)

    return Result.ok(user)
  }
}
