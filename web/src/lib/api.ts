import { cookies } from 'next/headers'

// Why this file exists at all: before it, every Route Handler repeated the
// same four lines (read cookie, build header, fetch, forward status) and
// they had already drifted -- one file used process.env.API_URL while every
// other used NEXT_PUBLIC_API_URL, which silently fetched `undefined/...`
// and failed at runtime with no type error. One helper means that class of
// drift cannot recur.
//
// Why it is server-only: it reads httpOnly cookies via next/headers, which
// throws if imported into a Client Component. That constraint is the point
// -- it makes accidental client-side token access a build failure rather
// than a security hole.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value ?? null
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null
  // Why auth is opt-in rather than automatic: public endpoints (search,
  // profile pages for logged-out visitors) must work without a token, and
  // silently attaching an empty Authorization header to those would send
  // `Bearer null` -- which the backend's verifyJwt rejects rather than
  // ignores. Making the caller state its intent avoids that whole class
  // of "why is this 401 when the route is public" confusion.
  auth?: boolean
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { auth = false, headers, ...rest } = options

  const finalHeaders = new Headers(headers)

  if (auth) {
    const token = await getToken()
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    // Why no-store everywhere: this app's data is a social feed, profiles,
    // and follow state -- all of it changes on user action and all of it is
    // wrong the moment it is stale. Next's default is to cache aggressively,
    // which would show a follow button that stays "Follow" after clicking.
    cache: 'no-store',
  })
}
