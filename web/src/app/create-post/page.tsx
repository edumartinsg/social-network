'use client'

import { MediaUploader } from '@/components/media-uploader'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!mediaUrl) {
      setError('Pick a photo or video first')
      return
    }

    setIsSubmitting(true)

    try {
      const payload =
        mediaType === 'video'
          ? {
              title,
              caption: caption || undefined,
              mediaType: 'video',
              videoUrl: mediaUrl,
              videoDurationSeconds: 600,
            }
          : {
              title,
              caption: caption || undefined,
              mediaType: 'image',
              imageUrls: [mediaUrl],
            }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message ?? 'Failed to create post')
      }

      router.push('/feed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto px-4 py-8 md:py-12">
        <h1 className="text-xl font-medium text-[var(--color-ink)] mb-6">New post</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <MediaUploader
            onUploaded={(url, type) => {
              setMediaUrl(url)
              setMediaType(type)
            }}
            onCleared={() => setMediaUrl(null)}
          />

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
            required
            minLength={3}
            maxLength={100}
          />

          <textarea
            placeholder="Write a caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
            maxLength={500}
          />

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !mediaUrl}
            className="rounded-[var(--radius-control)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? 'Posting...' : 'Share'}
          </button>
        </form>
      </main>
    </div>
  )
}
