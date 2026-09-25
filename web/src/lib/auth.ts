import { apiFetch, getToken } from './api'

export { getToken }

export interface CurrentUser {
  id: string
  username: string
  email: string
  avatarUrl: string | null
}

// Why this returns null instead of throwing on failure: every caller is a
// layout or page deciding what to render, and "not logged in" is a normal
// state for them, not an exception. Throwing would force a try/catch in
// every consumer to express something the type already says (`| null`).
//
// This mirrors the backend's own Result<T> reasoning: an expected outcome
// is a value, not a thrown error.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getToken()
  if (!token) return null

  const response = await apiFetch('/users/me', { auth: true })

  if (!response.ok) return null

  return response.json() as Promise<CurrentUser>
}
