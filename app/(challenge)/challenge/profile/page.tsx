'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useParticipant } from '@/hooks/use-participant'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function ChallengeProfilePage() {
  const { participant, isLoading, authUser, refetch } = useParticipant()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [heightInches, setHeightInches] = useState<number | ''>('')
  const [startingWeight, setStartingWeight] = useState<number | ''>('')
  const [goals, setGoals] = useState('')
  const [medications, setMedications] = useState('')
  const [protocols, setProtocols] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/challenge/login')
    }
  }, [isLoading, authUser, router])

  useEffect(() => {
    if (participant) {
      setFullName(participant.full_name)
      setAge(participant.age ?? '')
      setGender(participant.gender ?? '')
      setHeightInches(participant.height_inches ?? '')
      setStartingWeight(participant.starting_weight ?? '')
      setGoals(participant.goals ?? '')
      setMedications(participant.current_medications ?? '')
      setProtocols(participant.current_protocols ?? '')
    }
  }, [participant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)

    try {
      const res = await fetch('/api/challenge/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          age: age || null,
          gender: gender || null,
          height_inches: heightInches || null,
          starting_weight: startingWeight || null,
          goals: goals || null,
          current_medications: medications || null,
          current_protocols: protocols || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update profile.')
        return
      }

      setSaved(true)
      await refetch()
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
      </main>
    )
  }

  if (!participant) {
    return null
  }

  return (
    <main className="py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-steel-400">
            Manage your study profile and personal details
          </p>
        </div>

        {/* Study Status */}
        <Card variant="glass">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-steel-400">Study Status</p>
              <p className="text-white font-medium capitalize">
                {participant.status}
              </p>
            </div>
            <Badge className="bg-accent-cyan/15 text-accent-cyan capitalize">
              {participant.current_phase} Phase
            </Badge>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="full-name"
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="age"
                  label="Age"
                  type="number"
                  value={age}
                  onChange={(e) =>
                    setAge(e.target.value ? Number(e.target.value) : '')
                  }
                />
                <Select
                  id="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="height"
                  label="Height (inches)"
                  type="number"
                  value={heightInches}
                  onChange={(e) =>
                    setHeightInches(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                />
                <Input
                  id="weight"
                  label="Starting Weight (lbs)"
                  type="number"
                  value={startingWeight}
                  onChange={(e) =>
                    setStartingWeight(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                />
              </div>
              <Textarea
                id="goals"
                label="Goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="What do you hope to achieve?"
              />
              <Textarea
                id="medications"
                label="Current Medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="List any current medications"
              />
              <Textarea
                id="protocols"
                label="Current Protocols"
                value={protocols}
                onChange={(e) => setProtocols(e.target.value)}
                placeholder="List any current supplement or training protocols"
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
