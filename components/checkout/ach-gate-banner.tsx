'use client'

import { AlertCircle } from 'lucide-react'

export function AchGateBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent-blue/20 bg-accent-blue/10 p-4">
      <AlertCircle className="h-5 w-5 shrink-0 text-accent-blue mt-0.5" />
      <p className="text-sm text-steel-300">
        New clinic accounts must complete first order via wire transfer before
        card/ACH payments are enabled.
      </p>
    </div>
  )
}
