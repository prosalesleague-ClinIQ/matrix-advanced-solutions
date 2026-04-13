import type { Metadata } from 'next'
import { OnboardingContent } from './content'

const title = 'Clinic Onboarding'
const description =
  'Start your clinic onboarding with Matrix. Credentialing, category access, operational setup, and dedicated account support for qualified providers.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/clinic-onboarding' },
  openGraph: { title, description, url: '/clinic-onboarding' },
  twitter: { title, description },
}

export default function ClinicOnboardingPage() {
  return <OnboardingContent />
}
