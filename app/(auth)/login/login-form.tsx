'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/reset-password` }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess('Password reset link sent. Check your email.')
      setShowForgot(false)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Don't show Supabase's specific error — "Invalid login credentials"
        // vs "Email not confirmed" etc. leaks whether a user exists.
        // Log real error to console for debugging, show generic message.
        console.error('[LOGIN] Auth error:', authError)
        const msg = authError.message?.toLowerCase() ?? ''
        if (msg.includes('confirm') || msg.includes('verify')) {
          setError('Please verify your email address before signing in.')
        } else {
          setError('Invalid email or password.')
        }
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      let target = redirect
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (
          profile &&
          ['matrix_admin', 'matrix_staff'].includes(profile.role)
        ) {
          target = '/admin/dashboard'
        }
      }

      // Hard navigation so the browser sends the freshly-set auth cookie on the
      // next request. router.push keeps the SPA session and middleware sees the
      // request as unauthenticated, bouncing the user back to /login.
      window.location.assign(target)
      return
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="glass">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-sm text-steel-400">
            Welcome back to Matrix Advanced Solutions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl p-3 text-sm text-green-300 bg-green-500/10 border border-green-500/20">
              {success}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="clinic@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />

          {showForgot ? (
            <>
              <Button
                type="button"
                className="w-full"
                disabled={isLoading}
                onClick={handleForgotPassword}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <button
                type="button"
                onClick={() => { setShowForgot(false); setError(null) }}
                className="text-sm text-steel-400 hover:text-white transition-colors w-full text-center"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setError(null); setSuccess(null) }}
                  className="text-xs text-steel-500 hover:text-accent-purple transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-sm text-center text-steel-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-accent-purple hover:text-accent-purple-light font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
