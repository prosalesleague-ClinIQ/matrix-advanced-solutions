type EventPayload = {
  event: string
  category?: string
  label?: string
  value?: number
  metadata?: Record<string, string | number | boolean>
}

export function trackEvent({ event, category, label, value, metadata }: EventPayload) {
  // Google Analytics / GTM
  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    ;(window as any).dataLayer.push({
      event,
      event_category: category,
      event_label: label,
      event_value: value,
      ...metadata,
    })
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && 'fbq' in window) {
    ;(window as any).fbq('trackCustom', event, { category, label, value, ...metadata })
  }

  // Structured log for server-side consumption
  if (process.env.NODE_ENV === 'development') {
    console.log('[Matrix Event]', { event, category, label, value, metadata })
  }
}

export function trackCTA(ctaName: string, page: string) {
  trackEvent({
    event: 'cta_click',
    category: 'conversion',
    label: ctaName,
    metadata: { page },
  })
}

export function trackFormSubmit(formName: string, page: string) {
  trackEvent({
    event: 'form_submit',
    category: 'conversion',
    label: formName,
    metadata: { page },
  })
}
