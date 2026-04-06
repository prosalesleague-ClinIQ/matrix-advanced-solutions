'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/lib/types/database'

interface UseClinicReturn {
  clinic: Clinic | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useClinic(clinicId: string | null | undefined): UseClinicReturn {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchClinic = async () => {
    if (!clinicId) {
      setClinic(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single()

      if (fetchError) throw fetchError
      setClinic(data)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch clinic')
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClinic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId])

  return {
    clinic,
    isLoading,
    error,
    refetch: fetchClinic,
  }
}
