'use client'

import { Input } from '@/components/ui/input'

interface OnboardingStepBusinessProps {
  formData: {
    name: string
    primaryContactName: string
    primaryPhone: string
    businessAddress: string
    taxId: string
  }
  onChange: (field: string, value: string) => void
  errors: Record<string, string[] | undefined>
}

export function OnboardingStepBusiness({
  formData,
  onChange,
  errors,
}: OnboardingStepBusinessProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Business Information</h3>
        <p className="text-sm text-steel-400">
          Tell us about your clinic or practice.
        </p>
      </div>

      <Input
        id="name"
        label="Clinic / Business Name"
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        error={errors.name?.[0]}
      />

      <Input
        id="primaryContactName"
        label="Primary Contact Name"
        value={formData.primaryContactName}
        onChange={(e) => onChange('primaryContactName', e.target.value)}
        error={errors.primaryContactName?.[0]}
      />

      <Input
        id="primaryPhone"
        label="Phone Number"
        type="tel"
        placeholder="(555) 123-4567"
        value={formData.primaryPhone}
        onChange={(e) => onChange('primaryPhone', e.target.value)}
        error={errors.primaryPhone?.[0]}
      />

      <Input
        id="businessAddress"
        label="Business Address"
        placeholder="123 Main St, Suite 100, City, State ZIP"
        value={formData.businessAddress}
        onChange={(e) => onChange('businessAddress', e.target.value)}
        error={errors.businessAddress?.[0]}
      />

      <Input
        id="taxId"
        label="Tax ID (EIN)"
        placeholder="XX-XXXXXXX"
        value={formData.taxId}
        onChange={(e) => onChange('taxId', e.target.value)}
        error={errors.taxId?.[0]}
      />
    </div>
  )
}
