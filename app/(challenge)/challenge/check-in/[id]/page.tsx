'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { useParticipant } from '@/hooks/use-participant'
import { CheckInForm } from '@/components/challenge/check-in-form'
import type { ChallengeEntry } from '@/lib/types/challenge'

export default function ChallengeCheckInEditPage() {
  const params = useParams()
  const id = params.id as string
  const { participant, challenge, isLoading, authUser } = useParticipant()
  const [entry, setEntry] = useState<ChallengeEntry | null>(null)
  const [entryLoading, setEntryLoading] = useState(true)
  const [entryError, setEntryError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/challenge/login')
    }
  }, [isLoading, authUser, router])

  useEffect(() => {
    if (!participant || !id) return

    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/challenge/entries/${id}`)
        if (!res.ok) {
          setEntryError('Entry not found.')
          return
        }
        const data = await res.json()
        setEntry(data.entry)
      } catch {
        setEntryError('Failed to load entry.')
      } finally {
        setEntryLoading(false)
      }
    }

    fetchEntry()
  }, [participant, id])

  if (isLoading || entryLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
      </main>
    )
  }

  if (entryError || !entry) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card variant="glass" className="max-w-md text-center p-8">
          <CardTitle className="text-xl mb-4">Entry Not Found</CardTitle>
          <p className="text-steel-400">
            {entryError || 'This check-in entry could not be loaded.'}
          </p>
        </Card>
      </main>
    )
  }

  if (!participant || !challenge) {
    return null
  }

  return (
    <main className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <CheckInForm
          participantId={participant.id}
          challengeId={challenge.id}
          weekNumber={entry.week_number}
          phase={entry.phase}
          existingEntry={entry}
          onSuccess={() => router.push('/challenge/dashboard')}
        />
      </div>
    </main>
  )
}
