import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { OnboardingPendingCard } from '@/components/onboarding/onboarding-pending-card'
import { OnboardingRejectedWrapper } from '@/components/onboarding/onboarding-rejected-wrapper'

export const metadata = {
  title: 'Clinic Onboarding',
}

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    redirect('/login')
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', profile.clinic_id)
    .single()

  if (!clinic) {
    redirect('/login')
  }

  // Already approved — go to dashboard
  if (clinic.onboarding_status === 'approved') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy-950 py-12 px-4">
      {clinic.onboarding_status === 'submitted' && (
        <OnboardingPendingCard submittedAt={clinic.onboarding_submitted_at} />
      )}

      {clinic.onboarding_status === 'rejected' && (
        <OnboardingRejectedWrapper
          clinic={clinic}
          rejectionReason={clinic.onboarding_rejection_reason}
        />
      )}

      {clinic.onboarding_status === 'pending' && (
        <OnboardingWizard clinic={clinic} />
      )}
    </div>
  )
}
