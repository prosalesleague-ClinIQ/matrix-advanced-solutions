'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ChallengeSignupData } from '@/lib/types/challenge'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function ChallengeSignupPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<ChallengeSignupData>({
    email: '',
    password: '',
    full_name: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  const updateField = <K extends keyof ChallengeSignupData>(
    key: K,
    value: ChallengeSignupData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleStep1Next = () => {
    setError(null)
    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/challenge/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.')
        return
      }

      router.push('/challenge/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join the Study</CardTitle>
          <p className="text-sm text-steel-400 mt-1">
            Step {step} of 2 &mdash;{' '}
            {step === 1 ? 'Account Details' : 'Your Profile'}
          </p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div
              className={
                step >= 1
                  ? 'h-1.5 w-12 rounded-full bg-accent-cyan'
                  : 'h-1.5 w-12 rounded-full bg-white/10'
              }
            />
            <div
              className={
                step >= 2
                  ? 'h-1.5 w-12 rounded-full bg-accent-cyan'
                  : 'h-1.5 w-12 rounded-full bg-white/10'
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                />
                <Input
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Input
                  id="full-name"
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  required
                />

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleStep1Next}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  id="age"
                  label="Age"
                  type="number"
                  placeholder="Your age"
                  value={formData.age ?? ''}
                  onChange={(e) =>
                    updateField('age', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
                <Select
                  id="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={GENDER_OPTIONS}
                  value={formData.gender ?? ''}
                  onChange={(e) => updateField('gender', e.target.value || undefined)}
                />
                <Input
                  id="height"
                  label="Height (inches)"
                  type="number"
                  placeholder="e.g. 70"
                  value={formData.height_inches ?? ''}
                  onChange={(e) =>
                    updateField(
                      'height_inches',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  id="starting-weight"
                  label="Starting Weight (lbs)"
                  type="number"
                  placeholder="e.g. 185"
                  value={formData.starting_weight ?? ''}
                  onChange={(e) =>
                    updateField(
                      'starting_weight',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Textarea
                  id="goals"
                  label="Goals"
                  placeholder="What do you hope to achieve during this study?"
                  value={formData.goals ?? ''}
                  onChange={(e) => updateField('goals', e.target.value || undefined)}
                />
                <Textarea
                  id="medications"
                  label="Current Medications"
                  placeholder="List any current medications (optional)"
                  value={formData.current_medications ?? ''}
                  onChange={(e) =>
                    updateField('current_medications', e.target.value || undefined)
                  }
                />
                <Textarea
                  id="protocols"
                  label="Current Protocols"
                  placeholder="List any current supplement or training protocols (optional)"
                  value={formData.current_protocols ?? ''}
                  onChange={(e) =>
                    updateField('current_protocols', e.target.value || undefined)
                  }
                />

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setError(null)
                      setStep(1)
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-sm text-steel-400 text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/challenge/login"
              className="text-accent-cyan hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
