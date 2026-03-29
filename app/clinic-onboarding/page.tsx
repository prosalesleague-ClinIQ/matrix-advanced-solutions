import type { Metadata } from 'next'
import { OnboardingContent } from './content'

export const metadata: Metadata = {
  title: 'Clinic Onboarding',
  description:
    'Start your clinic onboarding with Matrix. Credentialing, category access, operational setup, and dedicated account support for qualified providers.',
}

export default function ClinicOnboardingPage() {
  return <OnboardingContent />
}
