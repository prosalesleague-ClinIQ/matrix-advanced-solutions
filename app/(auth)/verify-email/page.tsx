import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Verify Email',
}

export default function VerifyEmailPage() {
  return (
    <Card variant="glass">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple/15">
          <Mail className="h-8 w-8 text-accent-purple" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Check Your Email
        </h1>
        <p className="text-steel-400 mb-6">
          We&apos;ve sent a verification link to your email address.
        </p>

        <p className="text-sm text-steel-500 mb-8">
          Click the link in your email to verify your account and get started.
          If you don&apos;t see it, check your spam folder.
        </p>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
