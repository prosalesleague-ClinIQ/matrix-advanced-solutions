'use client'

import { useState, type FormEvent } from 'react'
import { X, Plus, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Product } from '@/lib/types/database'
import { PRODUCT_UNITS } from '@/lib/constants'

interface ProductFormDialogProps {
  product?: Product
  suppliers: { id: string; name: string }[]
  categories: { value: string; label: string }[]
  onSuccess: () => void
}

const TIER_LABELS = ['1+', '25+', '50+', '100+']

const unitOptions = PRODUCT_UNITS.map((u) => ({
  value: u,
  label: u.charAt(0).toUpperCase() + u.slice(1),
}))

export function ProductFormDialog({ product, suppliers, categories, onSuccess }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(product)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? '',
    unit: product?.unit ?? '',
    supplier_id: product?.supplier_id ?? '',
    description: product?.description ?? '',
    prices: product?.prices ?? [0, 0, 0, 0],
    costs: product?.costs ?? [0, 0, 0, 0],
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateTier(field: 'prices' | 'costs', index: number, value: string) {
    setForm((prev) => {
      const arr = [...prev[field]]
      arr[index] = parseFloat(value) || 0
      return { ...prev, [field]: arr }
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          category: form.category,
          unit: form.unit,
          supplier_id: form.supplier_id || null,
          description: form.description || null,
          prices: form.prices,
          costs: form.costs,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save product')
      }

      setOpen(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))

  return (
    <>
      <Button
        variant={isEdit ? 'ghost' : 'primary'}
        size="sm"
        onClick={() => setOpen(true)}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Add Product</>}
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
              {isEdit ? 'Edit Product' : 'New Product'}
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
                label="SKU"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={categories}
                  placeholder="Select category"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  required
                />
                <Select
                  label="Unit"
                  options={unitOptions}
                  placeholder="Select unit"
                  value={form.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  required
                />
              </div>
              <Select
                label="Supplier"
                options={supplierOptions}
                placeholder="Select supplier"
                value={form.supplier_id}
                onChange={(e) => updateField('supplier_id', e.target.value)}
              />

              <div>
                <p className="text-sm font-medium text-steel-300 mb-2">Price Tiers</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIER_LABELS.map((label, i) => (
                    <Input
                      key={`price-${i}`}
                      label={label}
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.prices[i] || ''}
                      onChange={(e) => updateTier('prices', i, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-steel-300 mb-2">Cost Tiers</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIER_LABELS.map((label, i) => (
                    <Input
                      key={`cost-${i}`}
                      label={label}
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.costs[i] || ''}
                      onChange={(e) => updateTier('costs', i, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-300">
                  Description
                </label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[80px] resize-y"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
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
                  {isEdit ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
