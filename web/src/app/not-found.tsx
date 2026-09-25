import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-3">
      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
        404
      </p>
      <h1 className="text-xl font-medium text-[var(--color-ink)]">Nothing here</h1>
      <p className="text-sm text-[var(--color-ink-muted)] text-center max-w-xs">
        That page or profile does not exist.
      </p>
      <Link
        href="/feed"
        className="mt-2 rounded-[var(--radius-pill)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-sm px-5 py-2"
      >
        Back to feed
      </Link>
    </div>
  )
}
