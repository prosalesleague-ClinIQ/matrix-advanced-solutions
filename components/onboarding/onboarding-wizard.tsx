'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingProgress } from './onboarding-progress'
import { OnboardingStepBusiness } from './onboarding-step-business'
import { OnboardingStepShipping } from './onboarding-step-shipping'
import { OnboardingStepCompliance } from './onboarding-step-compliance'
import { OnboardingStepReview } from './onboarding-step-review'
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
} from '@/lib/validation'
import type { Clinic } from '@/lib/types/database'

interface OnboardingFormData {
  name: string
  primaryContactName: string
  primaryPhone: string
  businessAddress: string
  taxId: string
  shippingAddress: string
  shippingSameAsBusiness: boolean
  practiceType: string
  medicalLicense: string
  npiNumber: string
  assignedRepId: string
}

interface OnboardingWizardProps {
  clinic: Clinic
}

const STEP_TITLES = [
  'Business Information',
  'Shipping Address',
  'Compliance & Licensing',
  'Review & Submit',
]

export function OnboardingWizard({ clinic }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [formData, setFormData] = useState<OnboardingFormData>({
    name: clinic.name || '',
    primaryContactName: clinic.primary_contact_name || '',
    primaryPhone: clinic.primary_phone || '',
    businessAddress: clinic.business_address || '',
    taxId: clinic.tax_id || '',
    shippingAddress: clinic.shipping_address || '',
    shippingSameAsBusiness: false,
    practiceType: clinic.practice_type || '',
    medicalLicense: clinic.medical_license || '',
    npiNumber: clinic.npi_number || '',
    assignedRepId: clinic.assigned_rep_id || '',
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateStep = (step: number): boolean => {
    let result
    if (step === 0) {
      result = onboardingStep1Schema.safeParse(formData)
    } else if (step === 1) {
      result = onboardingStep2Schema.safeParse(formData)
    } else if (step === 2) {
      result = onboardingStep3Schema.safeParse(formData)
    } else {
      return true
    }

    if (!result || result.success) {
      setErrors({})
      return true
    }

    setErrors(result.error.flatten().fieldErrors)
    return false
  }

  const saveDraft = async () => {
    try {
      const res = await fetch('/api/onboarding/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          primary_contact_name: formData.primaryContactName,
          primary_phone: formData.primaryPhone,
          business_address: formData.businessAddress,
          tax_id: formData.taxId || null,
          shipping_address: formData.shippingAddress,
          practice_type: formData.practiceType || null,
          medical_license: formData.medicalLicense || null,
          npi_number: formData.npiNumber || null,
          assigned_rep_id: formData.assignedRepId || null,
        }),
      })
      if (!res.ok) {
        console.error('Draft save failed')
      }
    } catch {
      // Silent fail — drafts are best-effort
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    await saveDraft()
    setIsLoading(false)
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          primaryContactName: formData.primaryContactName,
          primaryPhone: formData.primaryPhone,
          businessAddress: formData.businessAddress,
          taxId: formData.taxId,
          shippingAddress: formData.shippingAddress,
          practiceType: formData.practiceType,
          medicalLicense: formData.medicalLicense,
          npiNumber: formData.npiNumber,
          assignedRepId: formData.assignedRepId || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to submit onboarding')
        return
      }

      window.location.reload()
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <OnboardingProgress currentStep={currentStep} />

      <Card variant="glass">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              {STEP_TITLES[currentStep]}
            </h2>
          </div>

          <div className="p-6">
            {submitError && (
              <div className="mb-4 rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                {submitError}
              </div>
            )}

            {currentStep === 0 && (
              <OnboardingStepBusiness
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {currentStep === 1 && (
              <OnboardingStepShipping
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <OnboardingStepCompliance
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <OnboardingStepReview
                formData={formData}
                onEdit={(step) => {
                  setErrors({})
                  setCurrentStep(step)
                }}
              />
            )}
          </div>

          <div className="flex justify-between px-6 py-4 border-t border-white/10">
            {currentStep > 0 ? (
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Next'}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-steel-500 mt-4">
        For qualified clinics and providers. Subject to credentialing and approval.
      </p>
    </div>
  )
}
