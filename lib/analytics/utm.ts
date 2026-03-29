export type UTMParams = {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
}

export function parseUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '' }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmTerm: params.get('utm_term') || '',
    utmContent: params.get('utm_content') || '',
  }
}

export function getPageContext() {
  if (typeof window === 'undefined') {
    return { landingPage: '', referrer: '', timestamp: new Date().toISOString() }
  }

  return {
    landingPage: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  }
}
