'use client'

import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Search, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/lib/types/database'

const TIER_LABELS = ['1+ units', '25+ units', '50+ units', '100+ units']

interface BundleItem {
  productId: string
  product: Product
  quantity: number
}

export default function AdminNewBundlePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Bundles',
    description: '',
    prices: [0, 0, 0, 0] as number[],
  })
  const [items, setItems] = useState<Record<string, BundleItem>>({})
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name')
      setProducts(prods ?? [])

      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) {
          const cats = await res.json()
          const arr = Array.isArray(cats) ? cats : []
          setCategories(
            arr
              .filter((c: { is_active: boolean }) => c.is_active)
              .map((c: { name: string }) => ({ value: c.name, label: c.name }))
          )
        }
      } catch {}
    }
    load()
  }, [])

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updatePrice(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.prices]
      next[index] = parseFloat(value) || 0
      return { ...prev, prices: next }
    })
  }

  function addItem(product: Product) {
    setItems((prev) => {
      if (prev[product.id]) {
        return {
          ...prev,
          [product.id]: { ...prev[product.id], quantity: prev[product.id].quantity + 1 },
        }
      }
      return {
        ...prev,
        [product.id]: { productId: product.id, product, quantity: 1 },
      }
    })
  }

  function updateItemQuantity(productId: string, quantity: number) {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity },
      }
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const itemList = Object.values(items)

  // Savings calc at tier 1
  const componentSum = itemList.reduce((sum, i) => sum + i.product.prices[0] * i.quantity, 0)
  const bundlePrice = form.prices[0]
  const savings = componentSum - bundlePrice

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const q = productSearch.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [products, productSearch])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (itemList.length === 0) {
      setError('Add at least one product to the bundle')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          description: form.description || null,
          category: form.category,
          prices: form.prices,
          items: itemList.map((i, idx) => ({
            productId: i.productId,
            quantity: i.quantity,
            displayOrder: idx,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to create bundle')
      }

      const { bundle } = await res.json()
      router.push(`/admin/bundles/${bundle.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bundles"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Bundles
        </Link>
        <h1 className="text-2xl font-bold text-white">New Bundle</h1>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Bundle Name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SKU"
                  placeholder="BUNDLE-XXX"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  required
                />
                <Select
                  label="Category"
                  options={categories.length > 0 ? categories : [{ value: 'Bundles', label: 'Bundles' }]}
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-300">Description</label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 hover:border-white/20 min-h-[80px] resize-y"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="What makes this bundle special..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-500" />
                <Input
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredProducts.map((product) => {
                  const inBundle = items[product.id]
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product)}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{product.name}</p>
                        <p className="text-xs text-steel-500 font-mono">{product.sku} · {product.category}</p>
                      </div>
                      <span className="text-sm text-steel-300 tabular-nums">
                        {formatCurrency(product.prices[0])}
                      </span>
                      {inBundle ? (
                        <span className="text-xs text-accent-purple font-semibold">×{inBundle.quantity}</span>
                      ) : (
                        <Plus className="h-4 w-4 text-steel-500" />
                      )}
                    </button>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-steel-500 text-sm py-4">No products match</p>
                )}
              </div>

              {itemList.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <p className="text-xs font-medium text-steel-400 uppercase tracking-wide">Bundle Contents</p>
                  {itemList.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-steel-500">{formatCurrency(item.product.prices[0])} each</p>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bundle Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {TIER_LABELS.map((label, i) => (
                  <Input
                    key={i}
                    label={label}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.prices[i] || ''}
                    onChange={(e) => updatePrice(i, e.target.value)}
                  />
                ))}
              </div>

              {itemList.length > 0 && bundlePrice > 0 && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm space-y-1">
                  <div className="flex justify-between text-steel-400">
                    <span>Sum of components (tier 1)</span>
                    <span className="tabular-nums">{formatCurrency(componentSum)}</span>
                  </div>
                  <div className="flex justify-between text-steel-400">
                    <span>Bundle price (tier 1)</span>
                    <span className="tabular-nums">{formatCurrency(bundlePrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-white/10 mt-1">
                    <span className={savings >= 0 ? 'text-green-400' : 'text-amber-400'}>
                      {savings >= 0 ? 'Clinic saves' : 'Bundle costs more by'}
                    </span>
                    <span className={`tabular-nums ${savings >= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                      {formatCurrency(Math.abs(savings))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-steel-400">
              <p>After creating the bundle, you can upload an image, toggle featured status, and activate it from the edit page.</p>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Create Bundle
              </Button>
              <Link href="/admin/bundles" className="block">
                <Button type="button" variant="ghost" className="w-full">Cancel</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
