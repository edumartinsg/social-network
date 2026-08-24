import Link from 'next/link'
import Image from 'next/image'
import styles from './post-card.module.css'

export interface FeedPostView {
  id: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  caption: string | null
  authorUsername: string
}

interface PostCardProps {
  post: FeedPostView
}

// Clicking the image goes to the author's profile, not the post itself --
// the feed is a discovery surface for people, per the brief, not a
// permalink surface for individual posts. The whole card is one Link so
// the hit target matches what the hover state visually promises.
export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/profile/${post.authorUsername}`} className={styles.card}>
      <Image
        src={post.mediaUrl}
        alt=""
        width={480}
        height={480}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className={styles.image}
      />
      <span className={styles.handle}>@{post.authorUsername}</span>
      {post.caption && (
        <span className={styles.scrim}>
          <span className={styles.caption}>{post.caption}</span>
        </span>
      )}
    </Link>
  )
}
