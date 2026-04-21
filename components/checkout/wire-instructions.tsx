'use client'

import { Card } from '@/components/ui/card'
import { WIRE_INSTRUCTIONS } from '@/lib/constants'
import { Building2, Copy, Smartphone } from 'lucide-react'
import { useState } from 'react'

interface WireInstructionsProps {
  orderNumber?: string
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 inline-flex items-center text-steel-500 hover:text-steel-300 transition-colors"
      title="Copy to clipboard"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied && (
        <span className="ml-1 text-xs text-accent-purple">Copied</span>
      )}
    </button>
  )
}

export function WireInstructions({ orderNumber }: WireInstructionsProps) {
  const fields = [
    { label: 'Bank Name', value: WIRE_INSTRUCTIONS.bankName, mono: false },
    { label: 'Routing Number', value: WIRE_INSTRUCTIONS.routingNumber, mono: true },
    { label: 'Account Number', value: WIRE_INSTRUCTIONS.accountNumber, mono: true },
    { label: 'Account Name', value: WIRE_INSTRUCTIONS.accountName, mono: false },
  ]

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15">
          <Building2 className="h-5 w-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Wire Transfer Instructions
          </h3>
          <p className="text-xs text-steel-400">
            Send payment to the account below
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-steel-400 mb-1">{field.label}</p>
            <div className="flex items-center">
              <span
                className={
                  field.mono
                    ? 'font-mono text-sm text-white tracking-wide'
                    : 'text-sm text-white'
                }
              >
                {field.value}
              </span>
              {field.mono && <CopyButton value={field.value} />}
            </div>
          </div>
        ))}
      </div>

      {/* Reference note */}
      <div className="mt-5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 p-3">
        <p className="text-xs text-steel-300">
          <span className="font-medium text-white">Reference:</span>{' '}
          {orderNumber
            ? `Include "${orderNumber}" as the wire reference / memo.`
            : WIRE_INSTRUCTIONS.reference}
        </p>
      </div>

      {/* Zelle alternative (for smaller orders under the payer's Zelle limit) */}
      <div className="mt-3 flex items-start gap-3 rounded-lg border border-white/8 bg-white/3 p-3">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" />
        <div className="flex-1 text-xs text-steel-300">
          <p>
            <span className="font-medium text-white">Prefer Zelle?</span> Send payment to{' '}
            <span className="font-mono text-white">Leo@matrixadvancedsolutions.com</span>
            <CopyButton value="Leo@matrixadvancedsolutions.com" />
            {orderNumber ? (
              <>
                {' '}with{' '}
                <span className="font-mono text-white">{orderNumber}</span>
                {' '}as the memo.
              </>
            ) : (
              <> with the payment invoice number as the memo.</>
            )}
          </p>
          <p className="mt-1 text-steel-500">
            Subject to your bank&apos;s Zelle daily/monthly limits.
          </p>
        </div>
      </div>
    </Card>
  )
}
