'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, ClipboardList, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useParticipant } from '@/hooks/use-participant'
import { PhaseIndicator } from '@/components/challenge/phase-indicator'
import { WeekTimeline } from '@/components/challenge/week-timeline'
import { MeasurementCard } from '@/components/challenge/measurement-card'
import { MEASUREMENT_FIELDS } from '@/lib/types/challenge'
import type { ChallengeEntry, MeasurementKey } from '@/lib/types/challenge'

export default function ChallengeDashboardPage() {
  const { participant, challenge, isLoading, authUser } = useParticipant()
  const [entries, setEntries] = useState<ChallengeEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/challenge/login')
    }
  }, [isLoading, authUser, router])

  useEffect(() => {
    if (!participant) return

    const fetchEntries = async () => {
      try {
        const res = await fetch('/api/challenge/entries')
        if (res.ok) {
          const data = await res.json()
          setEntries(data.entries ?? [])
        }
      } catch {
        // Silently handle — entries will show as empty
      } finally {
        setEntriesLoading(false)
      }
    }

    fetchEntries()
  }, [participant])

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
      </main>
    )
  }

  if (!participant) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card variant="glass" className="max-w-md text-center p-8">
          <CardTitle className="text-xl mb-4">No Enrollment Found</CardTitle>
          <p className="text-steel-400 mb-6">
            It looks like you haven&apos;t enrolled in the study yet.
          </p>
          <Link href="/challenge/signup">
            <Button>Join the Study</Button>
          </Link>
        </Card>
      </main>
    )
  }

  const latestEntry = entries.length > 0 ? entries[0] : null
  const completedWeeks = entries.map((e) => e.week_number)
  const isBaseline = participant.current_phase === 'baseline'

  return (
    <main className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {participant.full_name.split(' ')[0]}
          </h1>
          <p className="text-steel-400">
            Your transformation study dashboard
          </p>
        </div>

        {/* Phase + Timeline */}
        {challenge && (
          <div className="space-y-6">
            <PhaseIndicator
              currentPhase={participant.current_phase}
            />
            <WeekTimeline
              totalWeeks={challenge.duration_weeks}
              completedWeeks={completedWeeks}
              currentWeek={completedWeeks.length > 0 ? Math.max(...completedWeeks) + 1 : 1}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/challenge/check-in">
            <Card variant="glass" className="group cursor-pointer hover:border-accent-cyan/30 transition-colors">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="rounded-lg bg-accent-cyan/10 p-3">
                  <ClipboardList className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {isBaseline ? 'Record Baseline' : 'Week Check-In'}
                  </p>
                  <p className="text-sm text-steel-400">
                    {isBaseline
                      ? 'Log your starting measurements'
                      : 'Log this week\'s measurements'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-steel-500 group-hover:text-accent-cyan transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/challenge/progress">
            <Card variant="glass" className="group cursor-pointer hover:border-accent-cyan/30 transition-colors">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="rounded-lg bg-accent-cyan/10 p-3">
                  <TrendingUp className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">View Progress</p>
                  <p className="text-sm text-steel-400">
                    Charts, trends, and comparisons
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-steel-500 group-hover:text-accent-cyan transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Latest Measurements */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Latest Measurements
          </h2>
          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-steel-500" />
            </div>
          ) : latestEntry ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {MEASUREMENT_FIELDS.map((field) => {
                const value = latestEntry[field.key as keyof ChallengeEntry] as number | null
                return (
                  <MeasurementCard
                    key={field.key}
                    label={field.label}
                    value={value}
                    unit={field.unit}
                    measurementKey={field.key as MeasurementKey}
                  />
                )
              })}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-8">
              <p className="text-steel-400">
                No measurements recorded yet. Start your first check-in!
              </p>
            </Card>
          )}
        </section>

        {/* Check-in History */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Check-in History
          </h2>
          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-steel-500" />
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/challenge/check-in/${entry.id}`}>
                  <Card variant="glass" className="cursor-pointer hover:border-white/20 transition-colors">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-accent-cyan/15 text-accent-cyan">
                          Week {entry.week_number}
                        </Badge>
                        <span className="text-sm text-steel-300 capitalize">
                          {entry.phase} phase
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {entry.weight && (
                          <span className="text-sm text-steel-400">
                            {entry.weight} lbs
                          </span>
                        )}
                        <span className="text-xs text-steel-500">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </span>
                        <ArrowRight className="h-4 w-4 text-steel-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-8">
              <p className="text-steel-400">
                No check-ins yet. Your history will appear here.
              </p>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}
