import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-4 text-steel-400">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
