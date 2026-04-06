'use client'

import { useState, type FormEvent } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WireConfirmDialogProps {
  orderId: string
  orderNumber: string
  onSuccess: () => void
}

export function WireConfirmDialog({ orderId, orderNumber, onSuccess }: WireConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [wireReference, setWireReference] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (wireReference.trim().length < 3) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/wire-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, wireReference: wireReference.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to confirm wire')
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setWireReference('')
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CheckCircle className="h-4 w-4" /> Confirm Wire
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-surface-card border border-white/10 rounded-2xl max-w-lg w-full mx-4 p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-steel-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-white mb-1">
              Confirm Wire Payment
            </h2>
            <p className="text-sm text-steel-400 mb-4">
              Order {orderNumber}
            </p>

            {success ? (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Wire payment confirmed successfully.
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Wire Reference"
                    placeholder="Enter wire reference number"
                    value={wireReference}
                    onChange={(e) => setWireReference(e.target.value)}
                    required
                    error={
                      wireReference.length > 0 && wireReference.trim().length < 3
                        ? 'Minimum 3 characters'
                        : undefined
                    }
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || wireReference.trim().length < 3}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm Payment
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
