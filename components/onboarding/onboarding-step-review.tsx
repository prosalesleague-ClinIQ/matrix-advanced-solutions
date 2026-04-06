'use client'

import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { PRACTICE_TYPE_OPTIONS } from '@/lib/constants'

interface OnboardingStepReviewProps {
  formData: {
    name: string
    primaryContactName: string
    primaryPhone: string
    businessAddress: string
    taxId: string
    shippingAddress: string
    practiceType: string
    medicalLicense: string
    npiNumber: string
    assignedRepId: string
  }
  onEdit: (step: number) => void
}

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-white">{title}</h4>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple-light transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-steel-500 min-w-[140px]">{label}:</span>
      <span className="font-medium text-steel-300">{value || '\u2014'}</span>
    </div>
  )
}

export function OnboardingStepReview({
  formData,
  onEdit,
}: OnboardingStepReviewProps) {
  const [repName, setRepName] = useState<string>('')

  const practiceLabel =
    PRACTICE_TYPE_OPTIONS.find((pt) => pt.value === formData.practiceType)
      ?.label || formData.practiceType

  useEffect(() => {
    async function fetchRepName() {
      if (!formData.assignedRepId) {
        setRepName('')
        return
      }
      try {
        const res = await fetch('/api/sales-reps')
        if (res.ok) {
          const reps: Array<{ id: string; name: string }> = await res.json()
          const match = reps.find((r) => r.id === formData.assignedRepId)
          setRepName(match?.name ?? '')
        }
      } catch {
        // Silent fail
      }
    }
    fetchRepName()
  }, [formData.assignedRepId])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Review & Submit</h3>
        <p className="text-sm text-steel-400">
          Please verify all information before submitting for review.
        </p>
      </div>

      <Section title="Business Information" step={0} onEdit={onEdit}>
        <Field label="Clinic Name" value={formData.name} />
        <Field label="Contact Name" value={formData.primaryContactName} />
        <Field label="Phone" value={formData.primaryPhone} />
        <Field label="Business Address" value={formData.businessAddress} />
        <Field label="Tax ID" value={formData.taxId} />
      </Section>

      <Section title="Shipping Address" step={1} onEdit={onEdit}>
        <Field label="Shipping Address" value={formData.shippingAddress} />
      </Section>

      <Section title="Compliance & Licensing" step={2} onEdit={onEdit}>
        <Field label="Practice Type" value={practiceLabel} />
        <Field label="Medical License" value={formData.medicalLicense} />
        <Field label="NPI Number" value={formData.npiNumber} />
        <Field label="Sales Rep" value={repName} />
      </Section>
    </div>
  )
}
