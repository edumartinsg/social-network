import { AuthShell } from '@/components/auth-shell'
import { LoginForm } from '@/components/login-form'
import { getToken } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const token = await getToken()
  if (token) redirect('/feed')

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your feed"
      footer={{ text: "Don't have an account?", linkLabel: 'Sign up', href: '/register' }}
    >
      <LoginForm />
    </AuthShell>
  )
}
