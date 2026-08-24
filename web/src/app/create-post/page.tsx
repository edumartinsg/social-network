'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, mediaType: 'article', body }),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data.message ?? 'Failed to create post')
      return
    }

    router.push('/feed')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">New Post</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded p-2"
        required
      />
      <textarea
        placeholder="Write at least 100 characters..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border rounded p-2 h-40"
        required
      />
      <button type="submit" className="bg-black text-white rounded p-2">
        Post
      </button>
    </form>
  )
}
