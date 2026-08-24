'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AvatarUploaderProps {
  currentAvatarUrl: string | null
}

// Uploads as soon as a file is picked, no separate confirm step. An avatar
// is a single, low-stakes field, unlike a multi-field post form, so the
// extra step would be friction without a real error-recovery benefit --
// and any failure just reverts the optimistic preview.
export function AvatarUploader({ currentAvatarUrl }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/users/avatar', {
      method: 'POST',
      body: formData,
    })

    setIsUploading(false)

    if (!response.ok) {
      const data = await response.json()
      setError(data.message ?? 'Upload failed')
      setPreview(currentAvatarUrl)
    }
  }

  return (
    <label className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--color-line)] cursor-pointer block">
      {preview && <Image src={preview} alt="" fill className="object-cover" />}
      {isUploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)] text-xs text-[var(--color-ink-inverse)]">
          ...
        </span>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {error && (
        <span className="absolute -bottom-6 left-0 text-xs text-red-600 whitespace-nowrap">
          {error}
        </span>
      )}
    </label>
  )
}
