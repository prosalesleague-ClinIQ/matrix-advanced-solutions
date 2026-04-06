'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useParticipant } from '@/hooks/use-participant'
import { ProgressChart } from '@/components/challenge/progress-chart'
import { MEASUREMENT_FIELDS } from '@/lib/types/challenge'
import type { ChallengeEntry } from '@/lib/types/challenge'

export default function ChallengeProgressPage() {
  const { participant, isLoading, authUser } = useParticipant()
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
        // Silently handle
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
    return null
  }

  // Sort entries by week ascending for charts
  const sortedEntries = [...entries].sort(
    (a, b) => a.week_number - b.week_number
  )

  // Check for photo entries
  const photoEntries = sortedEntries.filter(
    (e) => e.photo_front_url || e.photo_side_url || e.photo_back_url
  )

  // Wellness data
  const wellnessEntries = sortedEntries.filter(
    (e) => e.energy_level != null || e.sleep_quality != null
  )

  return (
    <main className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Progress</h1>
          <p className="text-steel-400">
            Track your transformation across all measurements
          </p>
        </div>

        {entriesLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-steel-500" />
          </div>
        ) : entries.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <TrendingUp className="h-10 w-10 text-steel-500 mx-auto mb-4" />
            <p className="text-steel-400">
              No data yet. Complete your first check-in to see progress charts.
            </p>
          </Card>
        ) : (
          <>
            {/* Measurement Charts */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Measurement Trends
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MEASUREMENT_FIELDS.map((field) => (
                  <ProgressChart
                    key={field.key}
                    label={field.label}
                    unit={field.unit}
                    data={sortedEntries.map((e) => ({
                      week: e.week_number,
                      value: (e[field.key as keyof ChallengeEntry] as number | null) ?? null,
                    }))}
                  />
                ))}
              </div>
            </section>

            {/* Wellness Trends */}
            {wellnessEntries.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Wellness Trends
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Energy Level */}
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-base">Energy Level</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sortedEntries
                        .filter((e) => e.energy_level != null)
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3">
                            <span className="text-xs text-steel-500 w-14 shrink-0">
                              Wk {entry.week_number}
                            </span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-cyan rounded-full transition-all"
                                /* energy_level is 1-10 scale */
                                style={{ width: `${(entry.energy_level ?? 0) * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-steel-300 w-6 text-right">
                              {entry.energy_level}
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Sleep Quality */}
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-base">Sleep Quality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sortedEntries
                        .filter((e) => e.sleep_quality != null)
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3">
                            <span className="text-xs text-steel-500 w-14 shrink-0">
                              Wk {entry.week_number}
                            </span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-purple rounded-full transition-all"
                                style={{ width: `${(entry.sleep_quality ?? 0) * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-steel-300 w-6 text-right">
                              {entry.sleep_quality}
                            </span>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Photo Comparison */}
            {photoEntries.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Photo Comparison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photoEntries.map((entry) => (
                    <Card key={entry.id} variant="glass">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Week {entry.week_number}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {entry.photo_front_url && (
                          <div>
                            <p className="text-xs text-steel-500 mb-1">Front</p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.photo_front_url}
                              alt={`Week ${entry.week_number} front`}
                              className="w-full rounded-lg object-cover aspect-3/4"
                            />
                          </div>
                        )}
                        {entry.photo_side_url && (
                          <div>
                            <p className="text-xs text-steel-500 mb-1">Side</p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.photo_side_url}
                              alt={`Week ${entry.week_number} side`}
                              className="w-full rounded-lg object-cover aspect-3/4"
                            />
                          </div>
                        )}
                        {entry.photo_back_url && (
                          <div>
                            <p className="text-xs text-steel-500 mb-1">Back</p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.photo_back_url}
                              alt={`Week ${entry.week_number} back`}
                              className="w-full rounded-lg object-cover aspect-3/4"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
