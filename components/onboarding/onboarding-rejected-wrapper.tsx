'use client'

import { useState } from 'react'
import { OnboardingRejectedCard } from './onboarding-rejected-card'
import { OnboardingWizard } from './onboarding-wizard'
import type { Clinic } from '@/lib/types/database'

interface OnboardingRejectedWrapperProps {
  clinic: Clinic
  rejectionReason: string | null
}

export function OnboardingRejectedWrapper({
  clinic,
  rejectionReason,
}: OnboardingRejectedWrapperProps) {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return <OnboardingWizard clinic={clinic} />
  }

  return (
    <OnboardingRejectedCard
      reason={rejectionReason}
      onEdit={() => setShowWizard(true)}
    />
  )
}
