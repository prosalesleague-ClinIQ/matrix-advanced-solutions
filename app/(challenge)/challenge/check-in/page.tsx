'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useParticipant } from '@/hooks/use-participant'
import { CheckInForm } from '@/components/challenge/check-in-form'
import type { ChallengeEntry, ChallengePhase } from '@/lib/types/database'

export default function ChallengeCheckInPage() {
  const { participant, challenge, isLoading, authUser } = useParticipant()
  const [nextWeek, setNextWeek] = useState(1)
  const [nextPhase, setNextPhase] = useState<ChallengePhase>('baseline')
  const [determining, setDetermining] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/challenge/login')
    }
  }, [isLoading, authUser, router])

  useEffect(() => {
    if (!participant) return

    const determineNext = async () => {
      try {
        const res = await fetch('/api/challenge/entries')
        if (res.ok) {
          const data = await res.json()
          const entries: ChallengeEntry[] = data.entries ?? []

          if (entries.length === 0) {
            setNextWeek(1)
            setNextPhase('baseline')
          } else {
            const maxWeek = Math.max(...entries.map((e) => e.week_number))
            const next = maxWeek + 1
            setNextWeek(next)

            if (next <= 2) {
              setNextPhase('baseline')
            } else if (next <= 10) {
              setNextPhase('protocol')
            } else {
              setNextPhase('results')
            }
          }
        }
      } catch {
        // Default to week 1 baseline
      } finally {
        setDetermining(false)
      }
    }

    determineNext()
  }, [participant])

  if (isLoading || determining) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
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
          weekNumber={nextWeek}
          phase={nextPhase}
          onSuccess={() => router.push('/challenge/dashboard')}
        />
      </div>
    </main>
  )
}
