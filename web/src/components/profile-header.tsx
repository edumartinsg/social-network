import Image from 'next/image'
import { AvatarUploader } from './avatar-uploader'
import { FollowButton } from './follow-button'

interface ProfileHeaderProps {
  username: string
  avatarUrl: string | null
  postCount: number
  isOwnProfile: boolean
  canFollow: boolean
  userId: string
  isFollowing: boolean
}

export function ProfileHeader({
  username,
  avatarUrl,
  postCount,
  isOwnProfile,
  canFollow,
  userId,
  isFollowing,
}: ProfileHeaderProps) {
  return (
    <header className="max-w-5xl mx-auto px-4 pt-8 pb-8 md:pt-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
        {isOwnProfile ? (
          <AvatarUploader currentAvatarUrl={avatarUrl} />
        ) : (
          <span className="relative w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-full overflow-hidden bg-[var(--color-surface-sunken)] block">
            {avatarUrl ? (
              <Image  src={avatarUrl} alt={`${username}'s avatar`} fill className="object-cover" />

            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-2xl text-[var(--color-ink-faint)]">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </span>

        )}


        <div className="flex flex-col items-center sm:items-start gap-3 min-w-0">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <h1 className="text-xl md:text-2xl font-medium text-[var(--color-ink)] truncate">
              @{username}
            </h1>
            {canFollow && <FollowButton userId={userId} initialIsFollowing={isFollowing} />}
          </div>

          <p className="text-sm text-[var(--color-ink-muted)]">
            <span className="font-medium text-[var(--color-ink)]">{postCount}</span>{' '}
            {postCount === 1 ? 'post' : 'posts'}
          </p>


        </div>
      </div>
    </header>
  )
}
