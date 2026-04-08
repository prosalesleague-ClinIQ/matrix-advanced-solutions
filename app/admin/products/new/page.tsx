'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/constants'

const TIER_LABELS = ['1+ units', '25+ units', '50+ units', '100+ units']

const categoryOptions = PRODUCT_CATEGORIES
  .filter((c) => c !== 'All')
  .map((c) => ({ value: c, label: c }))

const unitOptions = PRODUCT_UNITS.map((u) => ({
  value: u,
  label: u.charAt(0).toUpperCase() + u.slice(1),
}))

export default function AdminNewProductPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    supplier_id: '',
    description: '',
    prices: [0, 0, 0, 0],
    costs: [0, 0, 0, 0],
  })

  useEffect(() => {
    fetch('/api/admin/suppliers?active=true')
      .then((r) => r.json())
      .then((data) => setSuppliers(Array.isArray(data) ? data : data.suppliers ?? []))
      .catch(() => {})
  }, [])

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
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
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
        throw new Error(data?.error ?? 'Failed to create product')
      }

      const { product } = await res.json()
      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        <h1 className="text-2xl font-bold text-white">New Product</h1>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                required
              />
              <Select
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Unit"
                options={unitOptions}
                placeholder="Select unit"
                value={form.unit}
                onChange={(e) => updateField('unit', e.target.value)}
                required
              />
              <Select
                label="Supplier"
                options={supplierOptions}
                placeholder="No supplier"
                value={form.supplier_id}
                onChange={(e) => updateField('supplier_id', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-steel-300">Description</label>
              <textarea
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[80px] resize-y"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-steel-300 mb-3">Sell Prices</p>
              <div className="grid grid-cols-4 gap-3">
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
              <p className="text-sm font-medium text-steel-300 mb-3">Cost (COGS)</p>
              <div className="grid grid-cols-4 gap-3">
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Create Product
          </Button>
        </div>
      </form>
    </div>
  )
}
