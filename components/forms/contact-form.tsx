'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { contactSchema, type ContactFormData } from '@/lib/forms/validation'
import { submitLead } from '@/lib/forms/submit'

interface ContactFormProps {
  inquiryType?: string
  endpoint?: string
  formName?: string
}

const roleOptions = [
  { value: 'physician', label: 'Physician / Medical Director' },
  { value: 'np-pa', label: 'Nurse Practitioner / PA' },
  { value: 'clinic-owner', label: 'Clinic Owner / Operator' },
  { value: 'office-manager', label: 'Office Manager' },
  { value: 'business-dev', label: 'Business Development' },
  { value: 'other', label: 'Other' },
]

const categoryOptions = [
  { value: 'peptides', label: 'Peptides' },
  { value: 'exosomes', label: 'Exosomes' },
  { value: 'metabolic', label: 'Metabolic / GLP Support' },
  { value: 'sexual-health', label: 'Sexual Health' },
  { value: 'regenerative', label: 'Regenerative' },
  { value: 'longevity', label: 'Longevity & Performance' },
  { value: 'bundles', label: 'Bundles / Protocol Support' },
]

const urgencyOptions = [
  { value: 'immediate', label: 'Ready to start immediately' },
  { value: '30-days', label: 'Within 30 days' },
  { value: '90-days', label: 'Within 90 days' },
  { value: 'exploring', label: 'Just exploring' },
]

export function ContactForm({
  inquiryType = 'general',
  endpoint = '/api/contact',
  formName = 'contact',
}: ContactFormProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resultMessage, setResultMessage] = useState('')
  // Honeypot for spam
  const [honey, setHoney] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { inquiryType },
  })

  const onSubmit = async (data: ContactFormData) => {
    if (honey) return // Bot detected
    setSubmitState('loading')
    // submitLead() calls trackFormSubmit() on success — don't double-track here.

    const result = await submitLead(endpoint, { ...data, inquiryType }, formName)
    setSubmitState(result.success ? 'success' : 'error')
    setResultMessage(result.message)
  }

  if (submitState === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Request Received</h3>
        <p className="text-sm text-steel-400 max-w-md mx-auto">{resultMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Honeypot - hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          id="clinicName"
          label="Clinic Name"
          placeholder="Your clinic name"
          error={errors.clinicName?.message}
          {...register('clinicName')}
        />
        <Input
          id="contactName"
          label="Contact Name"
          placeholder="Your full name"
          error={errors.contactName?.message}
          {...register('contactName')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Select
          id="role"
          label="Your Role"
          placeholder="Select your role"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@clinic.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          id="phone"
          label="Phone (optional)"
          type="tel"
          placeholder="(555) 000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          id="state"
          label="State"
          placeholder="e.g. California"
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          id="specialty"
          label="Specialty (Optional)"
          placeholder="e.g. Integrative Medicine"
          {...register('specialty')}
        />
        <Select
          id="urgency"
          label="Timeline (Optional)"
          placeholder="Select timeline"
          options={urgencyOptions}
          {...register('urgency')}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes (Optional)"
        placeholder="Tell us about your clinic goals, current categories, or questions..."
        {...register('notes')}
      />

      <Input
        id="referralSource"
        label="How did you hear about Matrix? (Optional)"
        placeholder="e.g. referral, search, event"
        {...register('referralSource')}
      />

      {/* SMS Consent — Service / Reminders (Optional) */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-accent-blue focus:ring-accent-blue/50 focus:ring-offset-0"
            {...register('smsConsentService')}
          />
          <span className="text-xs text-steel-400 leading-relaxed">
            (Optional) I agree to receive Automated Reminders and Service-Based messages from Matrix Advanced Solutions LLC at the phone number provided above. This agreement is not a condition of any purchase. Msg &amp; data rates may apply. Message frequency varies. Text HELP to 831-298-8933 for assistance. Reply STOP or OUT to opt out at any time.
          </span>
        </label>
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
            (Optional) I agree to receive Marketing and Promotional messages from Matrix Advanced Solutions LLC at the phone number provided above. This agreement is not a condition of any purchase. Msg &amp; data rates may apply. Message frequency varies. Text HELP to 831-298-8933 for assistance. Reply STOP or OUT to opt out at any time.
          </span>
        </label>
      </div>

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

      {submitState === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{resultMessage}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitState === 'loading'}>
        {submitState === 'loading' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={18} />
            Submit Inquiry
          </>
        )}
      </Button>

      <p className="text-xs text-steel-600 text-center">
        Professional use only. Subject to credentialing and approval.
      </p>
    </form>
  )
}
