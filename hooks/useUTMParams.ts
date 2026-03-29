'use client'

import { useEffect, useState } from 'react'
import { type UTMParams, parseUTMParams } from '@/lib/analytics/utm'

export function useUTMParams(): UTMParams {
  const [params, setParams] = useState<UTMParams>({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
  })

  useEffect(() => {
    setParams(parseUTMParams())
  }, [])

  return params
}
