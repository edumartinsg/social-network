import { Nav } from '@/components/nav'
import { getToken } from '@/lib/auth'
import type { Metadata } from 'next'
import './globals.css'

// Why metadata is set here rather than per-page: these are the app-wide
// defaults every route inherits. Individual routes override only what
// differs, so this is the one place that has to be correct for every page
// that never thinks about it.
export const metadata: Metadata = {
  title: 'Social Network',
  description: 'A photo and video sharing network.',
}

// Why the layout reads the token: the nav has to know whether to show
// "Log in" or the authenticated links, and layouts render on every route.
// Doing this server-side means no page has to pass auth state down, and no
// client-side flash of the wrong nav ever happens -- the correct markup
// arrives already rendered.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await getToken()

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)]">
        <Nav isAuthenticated={Boolean(token)} />
        {/*
          Why the bottom padding is conditional on the nav token: on mobile
          the nav is a fixed bottom bar, so content scrolled to the end
          would sit underneath it without this reserve. On desktop the nav
          sits at the top and this padding is harmless.
        */}
        <div className="flex-1 pb-[var(--size-nav)] md:pb-0">{children}</div>
      </body>
    </html>
  )
}
