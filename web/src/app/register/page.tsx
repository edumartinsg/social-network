import { AuthShell } from '@/components/auth-shell'
import { RegisterForm } from '@/components/register-form'
import { getToken } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  const token = await getToken()
  if (token) redirect('/feed')

  return (
    <AuthShell
      title="Create your account"
      subtitle="Share photos and videos"
      footer={{ text: 'Already have an account?', linkLabel: 'Log in', href: '/login' }}
    >
      <RegisterForm />
    </AuthShell>
  )
}
