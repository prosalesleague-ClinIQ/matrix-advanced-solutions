'use client'

/**
 * OrderAdminActions — the card on the admin order detail page that
 * lets an admin actually move an order through its lifecycle.
 *
 * Slots in three controls:
 *   1. Confirm Wire Payment  (only shown when payment_status = 'awaiting_wire')
 *   2. Advance order status  (submitted → confirmed → processing → shipped → delivered)
 *      Plus a "Cancel Order" button that's always available unless terminal.
 *   3. Tracking number input + save (visible once the order is in 'shipped' status
 *      or the admin is about to mark it shipped).
 *
 * All changes go through the existing /api/admin/wire-confirm and the new
 * /api/admin/orders/[id]/status endpoints. On success, the page is refreshed
 * via router.refresh() so server-component data re-fetches.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Ban, Check, Loader2, Package, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WireConfirmDialog } from '@/components/admin/wire-confirm-dialog'
import type { OrderStatus, PaymentStatus } from '@/lib/types/database'

interface OrderAdminActionsProps {
  orderId: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  trackingNumber: string | null
}

// Label + destination state for the "advance" button, keyed by current state.
// null = no forward transition (terminal or no obvious next step).
const NEXT_STATUS: Record<string, { label: string; next: OrderStatus; icon: React.ReactNode } | null> = {
  draft: { label: 'Submit', next: 'submitted', icon: <ArrowRight className="h-4 w-4" /> },
  submitted: { label: 'Confirm Order', next: 'confirmed', icon: <Check className="h-4 w-4" /> },
  confirmed: { label: 'Move to Processing', next: 'processing', icon: <Package className="h-4 w-4" /> },
  processing: { label: 'Mark Shipped', next: 'shipped', icon: <Truck className="h-4 w-4" /> },
  shipped: { label: 'Mark Delivered', next: 'delivered', icon: <Check className="h-4 w-4" /> },
  delivered: null,
  cancelled: null,
}

export function OrderAdminActions({
  orderId,
  orderNumber,
  status,
  paymentStatus,
  trackingNumber,
}: OrderAdminActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<null | 'advance' | 'cancel' | 'tracking'>(null)
  const [error, setError] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState(trackingNumber ?? '')

  const nextStep = NEXT_STATUS[status] ?? null
  const isTerminal = status === 'delivered' || status === 'cancelled'
  const requiresTrackingFirst = nextStep?.next === 'shipped' && !trackingInput.trim()

  async function callStatusApi(payload: Record<string, unknown>, action: 'advance' | 'cancel' | 'tracking') {
    setLoading(action)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to update order')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  async function handleAdvance() {
    if (!nextStep) return
    // If the next step is shipped, make sure tracking is saved first.
    const payload: Record<string, unknown> = { status: nextStep.next }
    if (nextStep.next === 'shipped' && trackingInput.trim()) {
      payload.tracking_number = trackingInput.trim()
    }
    await callStatusApi(payload, 'advance')
  }

  async function handleCancel() {
    if (!confirm(`Cancel order ${orderNumber}? This cannot be undone.`)) return
    await callStatusApi({ status: 'cancelled' }, 'cancel')
  }

  async function handleTrackingSave() {
    await callStatusApi({ tracking_number: trackingInput.trim() || null }, 'tracking')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Wire confirmation — only when payment is awaiting_wire */}
        {paymentStatus === 'awaiting_wire' && (
          <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-4">
            <p className="text-sm font-medium text-accent-blue-light mb-3">
              Payment awaiting wire transfer
            </p>
            <WireConfirmDialog
              orderId={orderId}
              orderNumber={orderNumber}
              onSuccess={() => router.refresh()}
            />
          </div>
        )}

        {/* Tracking number — visible whenever the order is processing or later */}
        {['processing', 'shipped', 'delivered'].includes(status) && (
          <div className="space-y-2">
            <Input
              label="Tracking Number"
              placeholder="e.g. 1Z999AA10123456784"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleTrackingSave}
              disabled={loading === 'tracking' || trackingInput.trim() === (trackingNumber ?? '')}
              className="w-full"
            >
              {loading === 'tracking' && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Tracking Number
            </Button>
          </div>
        )}

        {/* Advance status */}
        {nextStep && (
          <Button
            onClick={handleAdvance}
            disabled={loading !== null || requiresTrackingFirst}
            className="w-full"
          >
            {loading === 'advance' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              nextStep.icon
            )}
            {nextStep.label}
          </Button>
        )}

        {requiresTrackingFirst && (
          <p className="text-xs text-amber-400">
            Enter a tracking number before marking this order shipped.
          </p>
        )}

        {/* Cancel button — available unless already terminal */}
        {!isTerminal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={loading !== null}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {loading === 'cancel' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Cancel Order
          </Button>
        )}

        {isTerminal && (
          <p className="text-xs text-steel-500 text-center pt-2">
            This order is in a terminal state and cannot be modified.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
