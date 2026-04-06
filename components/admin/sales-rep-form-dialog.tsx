'use client'

import { useState, type FormEvent } from 'react'
import { X, Plus, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SalesRep } from '@/lib/types/database'

interface SalesRepFormDialogProps {
  salesRep?: SalesRep
  onSuccess: () => void
}

export function SalesRepFormDialog({ salesRep, onSuccess }: SalesRepFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(salesRep)

  const [form, setForm] = useState({
    name: salesRep?.name ?? '',
    email: salesRep?.email ?? '',
    phone: salesRep?.phone ?? '',
    ghl_user_id: salesRep?.ghl_user_id ?? '',
    notes: salesRep?.notes ?? '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/sales-reps/${salesRep!.id}`
        : '/api/admin/sales-reps'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          ghl_user_id: form.ghl_user_id || null,
          notes: form.notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save sales rep')
      }

      setOpen(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={isEdit ? 'ghost' : 'primary'}
        size="sm"
        onClick={() => setOpen(true)}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Add Sales Rep</>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-surface-card border border-white/10 rounded-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-steel-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-white mb-4">
              {isEdit ? 'Edit Sales Rep' : 'New Sales Rep'}
            </h2>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
              <Input
                label="GHL User ID"
                value={form.ghl_user_id}
                onChange={(e) => updateField('ghl_user_id', e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-300">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[80px] resize-y"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update' : 'Create'} Sales Rep
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
