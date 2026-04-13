'use client'

import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  PackageOpen,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
  Search,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import type { Product, ProductBundle, ProductBundleItem } from '@/lib/types/database'

const TIER_LABELS = ['1+ units', '25+ units', '50+ units', '100+ units']

interface BundleItemLine {
  productId: string
  product: Product
  quantity: number
}

type BundleWithJoinedItems = ProductBundle & {
  items: Array<ProductBundleItem & { product: Product }>
}

export default function AdminBundleEditPage() {
  const params = useParams()
  const router = useRouter()
  const bundleId = params.id as string

  const [bundle, setBundle] = useState<ProductBundle | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Bundles',
    description: '',
    prices: [0, 0, 0, 0] as number[],
    is_active: true,
    is_featured: false,
  })
  const [items, setItems] = useState<Record<string, BundleItemLine>>({})
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [bundleRes, productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/bundles/${bundleId}`),
          supabase.from('products').select('*').eq('is_active', true).order('category').order('name'),
          fetch('/api/admin/categories'),
        ])

        if (bundleRes.ok) {
          const { bundle: b } = await bundleRes.json() as { bundle: BundleWithJoinedItems }
          setBundle(b)
          setForm({
            name: b.name,
            sku: b.sku,
            category: b.category,
            description: b.description ?? '',
            prices: b.prices,
            is_active: b.is_active,
            is_featured: b.is_featured,
          })
          const itemMap: Record<string, BundleItemLine> = {}
          for (const it of b.items ?? []) {
            itemMap[it.product_id] = {
              productId: it.product_id,
              product: it.product,
              quantity: it.quantity,
            }
          }
          setItems(itemMap)
        } else {
          setError('Failed to load bundle')
        }

        if (productsRes.data) setProducts(productsRes.data)

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json()
          const arr = Array.isArray(cats) ? cats : []
          setCategories(
            arr
              .filter((c: { is_active: boolean }) => c.is_active)
              .map((c: { name: string }) => ({ value: c.name, label: c.name }))
          )
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bundleId])

  function updateField(key: string, value: string | boolean) {
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

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (itemList.length === 0) {
      setError('Bundle must contain at least one product')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          category: form.category,
          description: form.description || null,
          prices: form.prices,
          is_active: form.is_active,
          is_featured: form.is_featured,
          items: itemList.map((i, idx) => ({
            productId: i.productId,
            quantity: i.quantity,
            displayOrder: idx,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save')
      }

      setSuccess('Bundle saved')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/admin/bundles/${bundleId}/image`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Upload failed')
      }
      const { imageUrl } = await res.json()
      setBundle((prev) => (prev ? { ...prev, image_url: imageUrl } : prev))
      setSuccess('Image uploaded')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleImageRemove() {
    setUploadingImage(true)
    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}/image`, { method: 'DELETE' })
      if (res.ok) {
        setBundle((prev) => (prev ? { ...prev, image_url: null } : prev))
      }
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this bundle? This cannot be undone.')) return
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete')
      }
      router.push('/admin/bundles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="text-center py-20">
        <p className="text-steel-400">Bundle not found</p>
        <Link href="/admin/bundles" className="text-accent-purple hover:underline text-sm mt-2 inline-block">
          Back to bundles
        </Link>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-white flex-1">{bundle.name}</h1>
        <Badge variant={bundle.is_active ? 'accent' : 'default'}>
          {bundle.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl p-3 text-sm text-green-300 bg-green-500/10 border border-green-500/20">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-3">
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
              </div>

              {itemList.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <p className="text-xs font-medium text-steel-400 uppercase tracking-wide">
                    Bundle Contents ({itemList.length})
                  </p>
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

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
                />
                <span className="text-sm text-steel-300">Active (visible in catalog)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
                />
                <span className="text-sm text-steel-300">Featured (appears at top of catalog)</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trash2 className="h-4 w-4" />
              Delete Bundle
            </Button>
            <div className="flex gap-3">
              <Link href="/admin/bundles">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bundle.image_url ? (
                <div className="relative">
                  <Image
                    src={bundle.image_url}
                    alt={bundle.name}
                    width={400}
                    height={300}
                    className="w-full aspect-[4/3] rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    disabled={uploadingImage}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-500/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2">
                  <PackageOpen className="h-10 w-10 text-steel-600" />
                  <p className="text-xs text-steel-500">No image</p>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-steel-300 hover:border-accent-purple/40 hover:text-white transition-colors">
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-steel-500">JPEG, PNG, or WebP. Max 2MB.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-steel-500">SKU</span>
                <span className="font-mono text-steel-300">{bundle.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Components</span>
                <span className="text-steel-300">{itemList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Created</span>
                <span className="text-steel-300">{new Date(bundle.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Updated</span>
                <span className="text-steel-300">{new Date(bundle.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
