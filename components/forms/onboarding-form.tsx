'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { onboardingSchema, type OnboardingFormData } from '@/lib/forms/validation'
import { submitLead } from '@/lib/forms/submit'
import { trackCTA } from '@/lib/analytics/track'

const clinicTypeOptions = [
  { value: 'medical-spa', label: 'Medical Spa / Aesthetic Clinic' },
  { value: 'integrative', label: 'Integrative Medicine' },
  { value: 'hormone', label: 'Hormone / Anti-Aging Clinic' },
  { value: 'weight-loss', label: 'Weight Loss / Metabolic Clinic' },
  { value: 'regenerative', label: 'Regenerative Medicine' },
  { value: 'primary-care', label: 'Primary Care with Advanced Services' },
  { value: 'multi-specialty', label: 'Multi-Specialty Practice' },
  { value: 'startup', label: 'Startup / Pre-Launch Clinic' },
  { value: 'other', label: 'Other' },
]

const providerCountOptions = [
  { value: '1', label: '1 Provider' },
  { value: '2-3', label: '2–3 Providers' },
  { value: '4-10', label: '4–10 Providers' },
  { value: '10+', label: '10+ Providers' },
]

const roleOptions = [
  { value: 'physician', label: 'Physician / Medical Director' },
  { value: 'np-pa', label: 'Nurse Practitioner / PA' },
  { value: 'clinic-owner', label: 'Clinic Owner / Operator' },
  { value: 'office-manager', label: 'Office Manager' },
  { value: 'other', label: 'Other' },
]

export function OnboardingForm() {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resultMessage, setResultMessage] = useState('')
  const [honey, setHoney] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { inquiryType: 'clinic_onboarding' },
  })

  const onSubmit = async (data: OnboardingFormData) => {
    if (honey) return
    setSubmitState('loading')
    trackCTA('form_clinic_onboarding_submit', 'form')

    const result = await submitLead('/api/clinic-onboarding', { ...data, inquiryType: 'clinic_onboarding' }, 'clinic_onboarding')
    setSubmitState(result.success ? 'success' : 'error')
    setResultMessage(result.message)
  }

  if (submitState === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Onboarding Request Received</h3>
        <p className="text-sm text-steel-400 max-w-md mx-auto">{resultMessage}</p>
        <p className="text-sm text-steel-400 mt-4">
          Our onboarding team will review your application and reach out within 1–2 business days with next steps.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="company_url" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input id="clinicName" label="Clinic Name" placeholder="Your clinic name" error={errors.clinicName?.message} {...register('clinicName')} />
        <Input id="contactName" label="Contact Name" placeholder="Your full name" error={errors.contactName?.message} {...register('contactName')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Select id="role" label="Your Role" placeholder="Select your role" options={roleOptions} error={errors.role?.message} {...register('role')} />
        <Select id="clinicType" label="Clinic Type" placeholder="Select clinic type" options={clinicTypeOptions} error={errors.clinicType?.message} {...register('clinicType')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input id="email" label="Email" type="email" placeholder="you@clinic.com" error={errors.email?.message} {...register('email')} />
        <Input id="phone" label="Phone" type="tel" placeholder="(555) 000-0000" error={errors.phone?.message} {...register('phone')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input id="state" label="State" placeholder="e.g. California" error={errors.state?.message} {...register('state')} />
        <Select id="providerCount" label="Provider Count" placeholder="How many providers?" options={providerCountOptions} error={errors.providerCount?.message} {...register('providerCount')} />
      </div>

      <Input id="specialty" label="Primary Specialty" placeholder="e.g. Integrative Medicine, Anti-Aging" {...register('specialty')} />

      <Textarea
        id="notes"
        label="Tell us about your clinic and goals"
        placeholder="What categories are you interested in? What stage is your clinic at? Any specific goals?"
        {...register('notes')}
      />

      {submitState === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{resultMessage}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitState === 'loading'}>
        {submitState === 'loading' ? (
          <><Loader2 size={18} className="animate-spin" /> Submitting...</>
        ) : (
          <><Send size={18} /> Start Onboarding Process</>
        )}
      </Button>

      <p className="text-xs text-steel-600 text-center">
        Subject to credentialing and approval. All information is reviewed confidentially.
      </p>
    </form>
  )
}
