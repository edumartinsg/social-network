'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AvatarUploaderProps {
  currentAvatarUrl: string | null
}

export function AvatarUploader({ currentAvatarUrl }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message ?? 'Upload failed')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentAvatarUrl)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative shrink-0">
      <label className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-[var(--color-surface-sunken)] cursor-pointer block group">
        {preview ? (
          <Image
            src={preview}
            alt="Your avatar"
            fill
            className="object-cover"
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[var(--color-ink-faint)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)] text-[var(--color-ink-inverse)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? 'Uploading' : 'Change'}
        </span>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>

      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-[var(--color-danger)] whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
