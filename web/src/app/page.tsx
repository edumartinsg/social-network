import { getToken } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const token = await getToken()

  if (token) {
    redirect('/feed')
  }

  redirect('/login')
}
