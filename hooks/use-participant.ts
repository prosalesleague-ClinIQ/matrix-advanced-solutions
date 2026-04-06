'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChallengeParticipant, Challenge } from '@/lib/types/database'
import type { User as AuthUser } from '@supabase/supabase-js'

interface UseParticipantReturn {
  authUser: AuthUser | null
  participant: ChallengeParticipant | null
  challenge: Challenge | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useParticipant(): UseParticipantReturn {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [participant, setParticipant] = useState<ChallengeParticipant | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchParticipant = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) {
        setAuthUser(null)
        setParticipant(null)
        setChallenge(null)
        return
      }

      setAuthUser(user)

      const { data: participantData, error: participantError } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (participantError) {
        if (participantError.code === 'PGRST116') {
          setParticipant(null)
          setChallenge(null)
          return
        }
        throw participantError
      }

      setParticipant(participantData)

      if (participantData?.challenge_id) {
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', participantData.challenge_id)
          .single()

        if (challengeError) throw challengeError
        setChallenge(challengeData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch participant'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipant()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchParticipant()
      } else {
        setAuthUser(null)
        setParticipant(null)
        setChallenge(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    authUser,
    participant,
    challenge,
    isLoading,
    error,
    refetch: fetchParticipant,
  }
}
