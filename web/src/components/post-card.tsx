import Image from 'next/image'
import Link from 'next/link'
import styles from './post-card.module.css'

export interface FeedPostView {
  id: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  caption: string | null
  authorUsername: string
  createdAt: string
}

interface PostCardProps {
  post: FeedPostView
  linkToProfile?: boolean
}

// Why this list exists here too, duplicating next.config.ts: next/image
// throws SYNCHRONOUSLY during render for a disallowed host, which is what
// crashed the whole feed over one bad row. There is no way to catch that
// per-image with a try/catch, because it happens inside React's render
// phase, not inside an event handler or an async function. The only way to
// prevent the crash is to never hand next/image a URL it will reject in
// the first place -- checking here, before the component is even chosen,
// is that check.
//
// The real fix is upstream of this file too: the value should never have
// reached the database with a bad host. This check is defence in depth,
// not a replacement for validating on write.
const ALLOWED_IMAGE_HOSTS = ['localhost', 's3.amazonaws.com']

function isAllowedImageHost(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_IMAGE_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
    )
  } catch {
    // Why an unparseable URL counts as "not allowed" rather than being
    // ignored: `new URL()` throws on a malformed string, and a value that
    // cannot even be parsed as a URL is certainly not one next/image can
    // safely load either.
    return false
  }
}

export function PostCard({ post, linkToProfile = true }: PostCardProps) {
  const isVideo = post.mediaType === 'video'
  const hasValidMedia = isAllowedImageHost(post.mediaUrl)

  const inner = (
    <>
      {!hasValidMedia ? (
        // Why a plain placeholder instead of skipping the card entirely:
        // the post still has a title, a caption, an author -- silently
        // vanishing it from the feed would be more confusing than showing
        // a card that visibly says its media could not load. This is also
        // the state a real broken upload or a deleted MinIO object should
        // degrade to, not just bad test data.
        <div className={styles.image} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-sunken)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>
            Image unavailable
          </span>
        </div>
      ) : isVideo ? (
        <video
          src={post.mediaUrl}
          className={styles.image}
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <Image
          src={post.mediaUrl}
          alt={post.caption ?? `Post by ${post.authorUsername}`}
          width={480}
          height={480}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={styles.image}
          style={{ width: '100%', height: 'auto' }}
        />
      )}

      <span className={styles.handle}>@{post.authorUsername}</span>

      {isVideo && hasValidMedia && (
        <span className={styles.videoBadge} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1l6 4-6 4z" />
          </svg>
        </span>
      )}

      {post.caption && (
        <span className={styles.scrim}>
          <span className={styles.caption}>{post.caption}</span>
        </span>
      )}
    </>
  )

  if (!linkToProfile) {
    return <div className={styles.card}>{inner}</div>
  }

  return (
    <Link href={`/profile/${post.authorUsername}`} className={styles.card}>
      {inner}
    </Link>
  )
}
