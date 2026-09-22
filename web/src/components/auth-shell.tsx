import Link from 'next/link';

interface AuthShellProps {
  title: string
  subtitle: string
  footer: { text: string; linkLabel: string; href: string }
  children: React.ReactNode
}

// Why login and register share a shell component rather than each owning
// their layout: they are the same screen with different fields, and any
// visual drift between them (different vertical rhythm, different wordmark
// size) reads as sloppiness on the two pages a first-time visitor is
// guaranteed to see. One shell makes drift impossible.
export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)] mb-3">
            Social Network
          </p>
          <h1 className="text-2xl font-medium text-[var(--color-ink)]">{title}</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-sm text-[var(--color-ink-muted)] mt-6">
          {footer.text}{' '}
          <Link href={footer.href} className="text-[var(--color-ink)] hover:underline">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
