'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingRejectedCardProps {
  reason: string | null
  onEdit: () => void
}

export function OnboardingRejectedCard({
  reason,
  onEdit,
}: OnboardingRejectedCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card variant="glass" className="max-w-md w-full text-center border-red-500/20">
        <CardContent className="p-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Application Needs Changes
          </h2>
          <p className="text-sm text-steel-400 mb-4">
            Your application was reviewed but requires some updates.
          </p>

          {reason && (
            <div className="rounded-xl p-3 text-sm text-left mb-6 bg-red-500/10 border border-red-500/20 text-red-300">
              <p className="font-medium mb-1">Reviewer feedback:</p>
              <p>{reason}</p>
            </div>
          )}

          <Button onClick={onEdit} className="w-full">
            Edit & Resubmit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
