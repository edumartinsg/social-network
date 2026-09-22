'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

interface MediaUploaderProps {
  onUploaded: (url: string, mediaType: 'image' | 'video') => void
  onCleared: () => void
}

type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export function MediaUploader({ onUploaded, onCleared }: MediaUploaderProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function pollUntilComplete(jobId: string): Promise<string> {
    const maxAttempts = 30
    const intervalMs = 1000

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`/api/files/upload/${jobId}`)
      if (!response.ok) throw new Error('Could not read upload status')

      const data = await response.json()

      if (data.status === 'completed' && data.url) return data.url
      if (data.status === 'failed') throw new Error('Upload failed while processing')

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error('Upload timed out. Is the upload worker running?')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image'
    setMediaType(type)
    setError(null)
    setStatus('uploading')

    setPreview(URL.createObjectURL(file))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message ?? 'Upload could not be started')
      }

      const { jobId } = await response.json()

      setStatus('processing')
      const url = await pollUntilComplete(jobId)

      setStatus('done')
      onUploaded(url, type)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
      onCleared()
    }
  }

  function handleClear() {
    setPreview(null)
    setStatus('idle')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onCleared()
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={`relative flex items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-dashed transition-colors ${
          preview
            ? 'border-transparent'
            : 'border-[var(--color-line-strong)] hover:border-[var(--color-ink-faint)] cursor-pointer'
        } bg-[var(--color-surface-sunken)] aspect-[4/5] w-full`}
      >
        {preview ? (
          mediaType === 'video' ? (
            <video src={preview} className="w-full h-full object-cover" muted playsInline controls />
          ) : (
            <Image src={preview} alt="" fill className="object-cover" unoptimized />
          )
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-[var(--color-ink-muted)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm">Choose a photo or video</span>
            <span className="text-xs text-[var(--color-ink-faint)]">JPG, PNG, WebP or MP4</span>
          </span>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[var(--color-scrim)] text-[var(--color-ink-inverse)]">
            <span className="text-sm">
              {status === 'uploading' ? 'Uploading...' : 'Processing...'}
            </span>
            {status === 'processing' && (
              <span className="text-[11px] opacity-70">worker is handling the file</span>
            )}
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={status === 'uploading' || status === 'processing'}
        />
      </label>

      {preview && status === 'done' && (
        <button
          type="button"
          onClick={handleClear}
          className="self-start text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline"
        >
          Choose a different file
        </button>
      )}

      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}
