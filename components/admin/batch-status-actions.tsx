'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BatchStatus } from '@/lib/types/database'
import { BATCH_STATUS_LABELS } from '@/lib/constants'

interface BatchStatusActionsProps {
  batchId: string
  currentStatus: BatchStatus
  onUpdate: () => void
}

const VALID_TRANSITIONS: Record<string, BatchStatus> = {
  draft: 'submitted',
  submitted: 'acknowledged',
  acknowledged: 'in_production',
  in_production: 'shipped',
  shipped: 'received',
}

export function BatchStatusActions({
  batchId,
  currentStatus,
  onUpdate,
}: BatchStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const nextStatus = VALID_TRANSITIONS[currentStatus]
  if (!nextStatus) return null

  async function handleTransition() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/batch/${batchId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to update status')
      }
      setNotes('')
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-steel-300">
          Notes (optional)
        </label>
        <textarea
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[60px] resize-y"
          placeholder="Add notes for this status change..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button size="sm" onClick={handleTransition} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        Move to {BATCH_STATUS_LABELS[nextStatus] ?? nextStatus}
      </Button>
    </div>
  )
}
