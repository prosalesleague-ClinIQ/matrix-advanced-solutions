import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChallengeNav } from '@/components/challenge/challenge-nav'

export default async function ChallengeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let participantName: string | undefined

  if (user) {
    const { data: participant } = await supabase
      .from('challenge_participants')
      .select('full_name')
      .eq('auth_user_id', user.id)
      .single()

    participantName = participant?.full_name ?? undefined
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <ChallengeNav
        isAuthenticated={!!user}
        participantName={participantName}
      />
      <div className="pt-16">{children}</div>
    </div>
  )
}
