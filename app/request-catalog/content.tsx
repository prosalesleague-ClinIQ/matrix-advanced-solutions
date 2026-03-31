'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { catalogFunnelSchema, type CatalogFunnelFormData } from '@/lib/forms/validation'
import { submitLead } from '@/lib/forms/submit'

export function RequestCatalogContent() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogFunnelFormData>({
    resolver: zodResolver(catalogFunnelSchema),
  })

  async function onSubmit(data: CatalogFunnelFormData) {
    setSubmitting(true)
    setErrorMessage('')

    const result = await submitLead(
      '/api/request-catalog',
      {
        ...data,
        inquiryType: 'catalog_request',
        smsConsentService: true,
        smsConsentMarketing: Boolean(data.smsConsentMarketing),
        smsConsentTimestamp: new Date().toISOString(),
      },
      'request-catalog-funnel'
    )

    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setErrorMessage(result.message)
    }
  }

  if (submitted) {
    return (
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
        <Container size="narrow">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Catalog Request Received
            </h1>
            <p className="text-steel-400 text-lg max-w-md">
              We&apos;ll send your full catalog and pricing within one business day.
            </p>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4 text-center">
            For Qualified Providers
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3 text-center">
            Request Full Catalog &amp; Pricing
          </h1>
          <p className="text-steel-400 text-center mb-10">
            Complete the form below and we&apos;ll send you our full product catalog with pricing details.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Input
              id="contactName"
              label="Your Name"
              placeholder="Dr. Jane Smith"
              error={errors.contactName?.message}
              {...register('contactName')}
            />

            <Input
              id="clinicName"
              label="Clinic Name"
              placeholder="Revive Wellness Clinic"
              error={errors.clinicName?.message}
              {...register('clinicName')}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="jane@reviveclinic.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="phone"
              label="Phone"
              type="tel"
              placeholder="(555) 000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* SMS Consent — Service / Reminders (Required) */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-accent-blue focus:ring-accent-blue/50 focus:ring-offset-0"
                  {...register('smsConsentService')}
                />
                <span className="text-xs text-steel-400 leading-relaxed">
                  I agree to receive Automated Reminders and Service-Based messages from Matrix Advanced Solutions LLC at the phone number provided above. This agreement is not a condition of any purchase. Msg &amp; data rates may apply. Message frequency varies. Text HELP to 831-298-8933 for assistance. Reply STOP or OUT to opt out at any time.
                </span>
              </label>
              {errors.smsConsentService?.message && (
                <p className="mt-1.5 text-xs text-red-400">{errors.smsConsentService.message}</p>
              )}
            </div>

            {/* SMS Consent — Marketing / Promotional (Optional) */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-accent-blue focus:ring-accent-blue/50 focus:ring-offset-0"
                  {...register('smsConsentMarketing')}
                />
                <span className="text-xs text-steel-400 leading-relaxed">
                  I agree to receive Marketing and Promotional messages from Matrix Advanced Solutions LLC at the phone number provided above. This agreement is not a condition of any purchase. Msg &amp; data rates may apply. Message frequency varies. Text HELP to 831-298-8933 for assistance. Reply STOP or OUT to opt out at any time.
                </span>
              </label>
            </div>

            {/* Terms/Privacy links */}
            <p className="text-xs text-steel-500">
              By submitting, you agree to our{' '}
              <Link href="/terms" className="text-accent-purple hover:text-accent-purple-light transition-colors underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors underline">
                Privacy Policy
              </Link>.
            </p>

            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Request Catalog'}
            </Button>

            <p className="text-[11px] text-steel-600 text-center">
              Professional use only. Subject to credentialing and approval.
            </p>
          </form>
        </div>
      </Container>
    </section>
  )
}
