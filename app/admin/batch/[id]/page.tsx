'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { BATCH_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

const batchStatusColors: Record<string, string> = {
  draft: 'bg-steel-600/20 text-steel-400',
  submitted: 'bg-accent-blue/15 text-accent-blue-light',
  acknowledged: 'bg-accent-purple/15 text-accent-purple-light',
  in_production: 'bg-yellow-500/15 text-yellow-400',
  shipped: 'bg-cyan-500/15 text-accent-cyan',
  received: 'bg-emerald-500/15 text-emerald-400',
}

interface BatchPO {
  id: string
  batch_number: string
  batch_date: string
  status: string
  total_items: number
  total_cost: number
  notes: string | null
  generated_by: string | null
  supplier_notes: string | null
}

interface BatchItem {
  id: string
  sku: string
  product_name: string
  total_quantity: number
  unit_cost: number
  line_cost: number
}

export default function AdminBatchDetailPage() {
  const params = useParams<{ id: string }>()
  const [batch, setBatch] = useState<BatchPO | null>(null)
  const [items, setItems] = useState<BatchItem[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: batchData }, { data: itemsData }] = await Promise.all([
        supabase.from('batch_pos').select('*').eq('id', params.id).single(),
        supabase
          .from('batch_po_items')
          .select('*')
          .eq('batch_po_id', params.id)
          .order('created_at', { ascending: true }),
      ])
      setBatch(batchData as BatchPO | null)
      setItems((itemsData as BatchItem[]) ?? [])
    }
    load()
  }, [params.id])

  if (!batch) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-steel-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/batch"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{batch.batch_number}</h1>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${batchStatusColors[batch.status] ?? 'bg-white/10 text-steel-300'}`}
          >
            {BATCH_STATUS_LABELS[batch.status] ?? batch.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Batch Items</CardTitle>
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
                      <th className="pb-3 text-right font-medium text-steel-500">Line Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="py-3 font-mono text-steel-400">{item.sku}</td>
                        <td className="py-3 text-white">{item.product_name}</td>
                        <td className="py-3 text-right text-steel-300">{item.total_quantity}</td>
                        <td className="py-3 text-right text-steel-300">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="py-3 text-right text-white font-medium">
                          {formatCurrency(item.line_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-steel-500">Date</dt>
                  <dd className="text-white">{formatDate(batch.batch_date)}</dd>
                </div>
                {batch.generated_by && (
                  <div className="flex justify-between">
                    <dt className="text-steel-500">Generated By</dt>
                    <dd className="text-steel-300 text-xs font-mono">{batch.generated_by}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-steel-500">Total Items</dt>
                  <dd className="text-white">{batch.total_items}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-steel-500">Total Cost</dt>
                  <dd className="text-white font-medium">{formatCurrency(batch.total_cost)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(BATCH_STATUS_LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 text-sm ${
                      key === batch.status ? 'text-white font-medium' : 'text-steel-600'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        key === batch.status ? 'bg-accent-purple' : 'bg-steel-700'
                      }`}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {batch.supplier_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-steel-300 whitespace-pre-line">
                  {batch.supplier_notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print Batch PO
          </Button>
        </div>
      </div>
    </div>
  )
}
