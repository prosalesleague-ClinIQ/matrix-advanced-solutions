'use client'

import { Input } from '@/components/ui/input'

interface OnboardingStepShippingProps {
  formData: {
    shippingAddress: string
    shippingSameAsBusiness: boolean
    businessAddress: string
  }
  onChange: (field: string, value: string | boolean) => void
  errors: Record<string, string[] | undefined>
}

export function OnboardingStepShipping({
  formData,
  onChange,
  errors,
}: OnboardingStepShippingProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Shipping Address</h3>
        <p className="text-sm text-steel-400">
          Where should orders be shipped?
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.shippingSameAsBusiness}
          onChange={(e) => {
            onChange('shippingSameAsBusiness', e.target.checked)
            if (e.target.checked) {
              onChange('shippingAddress', formData.businessAddress)
            }
          }}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
        />
        <span className="text-sm text-steel-300">Same as business address</span>
      </label>

      <Input
        id="shippingAddress"
        label="Shipping Address"
        placeholder="123 Main St, Suite 100, City, State ZIP"
        value={formData.shippingAddress}
        onChange={(e) => onChange('shippingAddress', e.target.value)}
        disabled={formData.shippingSameAsBusiness}
        error={errors.shippingAddress?.[0]}
      />
    </div>
  )
}
