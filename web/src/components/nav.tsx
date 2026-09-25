'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavProps {
  isAuthenticated: boolean
}

export function Nav({ isAuthenticated }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const links = isAuthenticated
    ? [
        { href: '/feed', label: 'Feed', icon: GridIcon },
        { href: '/create-post', label: 'Create', icon: PlusIcon },
        { href: '/me', label: 'Profile', icon: PersonIcon },
      ]
    : [
        { href: '/feed', label: 'Feed', icon: GridIcon },
        { href: '/login', label: 'Log in', icon: PersonIcon },
      ]

  // Why this calls a Route Handler rather than clearing anything directly:
  // the token lives in an httpOnly cookie, invisible to this component's
  // JavaScript by design -- that is the whole point of httpOnly. Only a
  // Set-Cookie header from the server can remove it, so logout is
  // necessarily a request, not a local state change.
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })

    // Why push then refresh, in that order: push alone would navigate to
    // /feed but leave this Server Component's already-rendered nav (and
    // the feed page itself, if cached) showing the authenticated version
    // for a moment, since Next reuses render output across a client-side
    // navigation. refresh forces the server to re-render with the now
    // logout in effect, so getToken() correctly returns null this time and
    // the nav updates to the logged-out state immediately rather than on
    // the next hard reload.
    router.push('/feed')
    router.refresh()
  }

  return (
    <>
      <header className="hidden md:flex sticky top-0 z-20 h-[var(--size-nav)] items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/85 backdrop-blur px-6">
        <Link
          href="/feed"
          className="text-sm font-semibold tracking-[var(--tracking-eyebrow)] uppercase text-[var(--color-ink)]"
        >
          Social Network
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-[var(--color-surface-sunken)] text-[var(--color-ink)] font-medium'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="rounded-[var(--radius-control)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              Log out
            </button>
          )}
        </nav>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 h-[var(--size-nav)] border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur flex items-stretch">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] ${
                isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)]'
              }`}
            >
              <Icon />
              {link.label}
            </Link>
          )
        })}
        {/* Why logout also needs its own tab on mobile, not just the
            desktop header: the mobile nav is a completely separate element
            (see the file-level note in the original version), so an
            action added only to the desktop header is invisible on
            mobile -- exactly the kind of split that is easy to forget
            with two parallel nav implementations. */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] text-[var(--color-ink-faint)]"
          >
            <LogoutIcon />
            Log out
          </button>
        )}
      </nav>
    </>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="13" height="13" rx="3" />
      <path d="M9 6v6M6 9h6" strokeLinecap="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="6" r="3" />
      <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12.5l3.5-3.5L12 5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 9H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
