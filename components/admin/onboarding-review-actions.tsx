'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { OnboardingStatus } from '@/lib/types/database'

interface OnboardingReviewActionsProps {
  clinicId: string
  currentStatus: OnboardingStatus
  onUpdate: () => void
}

export function OnboardingReviewActions({
  clinicId,
  currentStatus,
  onUpdate,
}: OnboardingReviewActionsProps) {
  const [salesReps, setSalesReps] = useState<{ id: string; name: string }[]>([])
  const [selectedRepId, setSelectedRepId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/sales-reps?active=true')
      .then((res) => res.json())
      .then((data) => setSalesReps(data.salesReps ?? data ?? []))
      .catch(() => {})
  }, [])

  if (currentStatus !== 'submitted') return null

  async function handleApprove() {
    setApproving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/onboarding/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          action: 'approve',
          assignedRepId: selectedRepId || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to approve')
      }
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 3) return
    setRejecting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/onboarding/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          action: 'reject',
          reason: rejectReason.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to reject')
      }
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRejecting(false)
    }
  }

  const repOptions = salesReps.map((r) => ({ value: r.id, label: r.name }))

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Approve section */}
      <div className="space-y-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <h3 className="text-sm font-medium text-green-400">Approve Application</h3>
        <Select
          label="Assign Sales Rep (optional)"
          options={repOptions}
          placeholder="No rep assigned"
          value={selectedRepId}
          onChange={(e) => setSelectedRepId(e.target.value)}
        />
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-500 text-white"
          onClick={handleApprove}
          disabled={approving}
        >
          {approving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Approve
        </Button>
      </div>

      {/* Reject section */}
      <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <h3 className="text-sm font-medium text-red-400">Reject Application</h3>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-steel-300">
            Reason (required)
          </label>
          <textarea
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[80px] resize-y"
            placeholder="Explain what needs to be corrected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          {rejectReason.length > 0 && rejectReason.trim().length < 3 && (
            <p className="text-xs text-red-400">Minimum 3 characters</p>
          )}
        </div>
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-500 text-white"
          onClick={handleReject}
          disabled={rejecting || rejectReason.trim().length < 3}
        >
          {rejecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject
        </Button>
      </div>
    </div>
  )
}
