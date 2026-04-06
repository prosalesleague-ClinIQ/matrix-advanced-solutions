'use client'

import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingPendingCardProps {
  submittedAt: string | null
}

export function OnboardingPendingCard({
  submittedAt,
}: OnboardingPendingCardProps) {
  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="glass" className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-purple/15 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Clock className="h-7 w-7 text-accent-purple" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Application Under Review
          </h2>
          <p className="text-sm text-steel-400 mb-4">
            Your onboarding application has been submitted and is being reviewed
            by our team.
          </p>

          <p className="text-sm text-steel-500">
            We typically review applications within 1-2 business days. You will
            be notified by email once your account is approved.
          </p>

          {formattedDate && (
            <p className="mt-6 text-xs text-steel-600">
              Submitted on {formattedDate}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
