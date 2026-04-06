'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    clinicName: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (formData.clinicName.trim().length < 2) {
      setError('Please enter your clinic name.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            clinic_name: formData.clinicName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/verify-email')
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
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-steel-400">
            Register your clinic with Matrix Advanced Solutions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <Input
            id="clinicName"
            name="clinicName"
            label="Clinic Name"
            placeholder="Acme Medical Clinic"
            value={formData.clinicName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            id="fullName"
            name="fullName"
            label="Your Full Name"
            placeholder="Dr. Jane Smith"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="clinic@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-sm text-center text-steel-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent-purple hover:text-accent-purple-light font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="text-xs text-center text-steel-500">
            For qualified clinics and providers. Subject to credentialing and approval.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
