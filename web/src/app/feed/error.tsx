'use client'

// Why this file exists at all: error.tsx is Next.js's convention for a
// route-level error boundary. Without it, an uncaught render error (like
// next/image throwing on a disallowed host) crashes the entire page, not
// just the one broken card. With it, Next.js catches the error, unmounts
// only the failing subtree, and renders this instead -- the rest of the
// app around it (nav, layout) stays intact.
//
// Why this is a Client Component ('use client') even though the page it
// protects is a Server Component: error boundaries in React are
// fundamentally a client-side mechanism (they rely on componentDidCatch
// under the hood), so Next.js requires this specific file to opt into
// client rendering regardless of what it is protecting.

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
        Something went wrong
      </p>
      <h1 className="text-lg font-medium text-[var(--color-ink)]">
        The feed could not be displayed
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] text-center max-w-sm">
        {/* Why the raw error message is not shown in production: it can
            leak internal details (a stack trace, a hostname, an internal
            error string). The digest is a safe, opaque reference Next.js
            generates specifically so a person can report a specific error
            without exposing what it actually said. */}
        {process.env.NODE_ENV === 'development' ? error.message : 'Please try again.'}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-[var(--radius-pill)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-sm px-5 py-2"
      >
        Try again
      </button>
    </div>
  )
}
