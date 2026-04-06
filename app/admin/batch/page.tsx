'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { BATCH_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const batchStatusColors: Record<string, string> = {
  draft: 'bg-steel-600/20 text-steel-400',
  submitted: 'bg-accent-blue/15 text-accent-blue-light',
  acknowledged: 'bg-accent-purple/15 text-accent-purple-light',
  in_production: 'bg-yellow-500/15 text-yellow-400',
  shipped: 'bg-cyan-500/15 text-accent-cyan',
  received: 'bg-emerald-500/15 text-emerald-400',
}

interface PendingItem {
  product_id: string
  sku: string
  product_name: string
  total_quantity: number
  unit_cost: number
  total_cost: number
}

interface BatchPO {
  id: string
  batch_number: string
  batch_date: string
  status: string
  total_items: number
  total_cost: number
}

export default function AdminBatchPage() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [batches, setBatches] = useState<BatchPO[]>([])
  const [generating, setGenerating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function loadData() {
    const supabase = createClient()
    const [{ data: pending }, { data: history }] = await Promise.all([
      supabase.from('v_pending_batch').select('*'),
      supabase
        .from('batch_pos')
        .select('id, batch_number, batch_date, status, total_items, total_cost')
        .order('created_at', { ascending: false })
        .limit(20),
    ])
    setPendingItems((pending as PendingItem[]) ?? [])
    setBatches((history as BatchPO[]) ?? [])
    setLoaded(true)
  }

  if (!loaded) {
    loadData()
  }

  async function handleGenerateBatch() {
    setGenerating(true)
    try {
      const res = await fetch('/api/batch/generate', { method: 'POST' })
      if (res.ok) {
        await loadData()
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Batch Management</h1>

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Orders</CardTitle>
            {pendingItems.length > 0 && (
              <Button size="sm" onClick={handleGenerateBatch} disabled={generating}>
                {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate Batch PO
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">SKU</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Product</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Qty</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Unit Cost</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => (
                  <tr key={item.product_id} className="border-b border-white/5">
                    <td className="py-3 font-mono text-steel-400">{item.sku}</td>
                    <td className="py-3 text-white">{item.product_name}</td>
                    <td className="py-3 text-right text-steel-300">{item.total_quantity}</td>
                    <td className="py-3 text-right text-steel-300">
                      {formatCurrency(item.unit_cost)}
                    </td>
                    <td className="py-3 text-right text-white font-medium">
                      {formatCurrency(item.total_cost)}
                    </td>
                  </tr>
                ))}
                {pendingItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel-500">
                      No pending items to batch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Batch History */}
      <Card>
        <CardHeader>
          <CardTitle>Batch History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">Batch #</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Date</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Status</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Items</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3">
                      <Link
                        href={`/admin/batch/${batch.id}`}
                        className="text-accent-purple hover:text-accent-purple-light font-medium"
                      >
                        {batch.batch_number}
                      </Link>
                    </td>
                    <td className="py-3 text-steel-400">{formatDate(batch.batch_date)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${batchStatusColors[batch.status] ?? 'bg-white/10 text-steel-300'}`}
                      >
                        {BATCH_STATUS_LABELS[batch.status] ?? batch.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-steel-300">{batch.total_items}</td>
                    <td className="py-3 text-right text-white font-medium">
                      {formatCurrency(batch.total_cost)}
                    </td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel-500">
                      No batch history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
