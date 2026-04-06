'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PRACTICE_TYPE_OPTIONS } from '@/lib/constants'

interface SalesRepOption {
  id: string
  name: string
}

interface OnboardingStepComplianceProps {
  formData: {
    practiceType: string
    medicalLicense: string
    npiNumber: string
    assignedRepId: string
  }
  onChange: (field: string, value: string) => void
  errors: Record<string, string[] | undefined>
}

export function OnboardingStepCompliance({
  formData,
  onChange,
  errors,
}: OnboardingStepComplianceProps) {
  const [salesReps, setSalesReps] = useState<SalesRepOption[]>([])
  const [repsLoading, setRepsLoading] = useState(true)

  useEffect(() => {
    async function fetchReps() {
      try {
        const res = await fetch('/api/sales-reps')
        if (res.ok) {
          const data = await res.json()
          setSalesReps(data)
        }
      } catch {
        // Silent fail — reps are optional
      } finally {
        setRepsLoading(false)
      }
    }
    fetchReps()
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Compliance & Licensing</h3>
        <p className="text-sm text-steel-400">
          Professional credentials required for verification.
        </p>
      </div>

      <Select
        id="practiceType"
        label="Practice Type"
        value={formData.practiceType}
        onChange={(e) => onChange('practiceType', e.target.value)}
        options={PRACTICE_TYPE_OPTIONS.map((pt) => ({
          value: pt.value,
          label: pt.label,
        }))}
        placeholder="Select practice type..."
        error={errors.practiceType?.[0]}
      />

      <Input
        id="medicalLicense"
        label="Medical / State License Number"
        value={formData.medicalLicense}
        onChange={(e) => onChange('medicalLicense', e.target.value)}
        error={errors.medicalLicense?.[0]}
      />

      <Input
        id="npiNumber"
        label="NPI Number"
        placeholder="10-digit NPI"
        value={formData.npiNumber}
        onChange={(e) => onChange('npiNumber', e.target.value)}
        error={errors.npiNumber?.[0]}
      />

      <Select
        id="assignedRepId"
        label="Sales Representative"
        value={formData.assignedRepId}
        onChange={(e) => onChange('assignedRepId', e.target.value)}
        disabled={repsLoading}
        options={salesReps.map((rep) => ({
          value: rep.id,
          label: rep.name,
        }))}
        placeholder={repsLoading ? 'Loading...' : 'Select your sales rep...'}
        error={errors.assignedRepId?.[0]}
      />
      <p className="text-xs text-steel-500 -mt-3">
        Select the representative who referred you to Matrix.
      </p>
    </div>
  )
}
