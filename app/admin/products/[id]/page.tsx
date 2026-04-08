'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { PRODUCT_UNITS } from '@/lib/constants'
import type { Product } from '@/lib/types/database'

const TIER_LABELS = ['1+ units', '25+ units', '50+ units', '100+ units']

const unitOptions = PRODUCT_UNITS.map((u) => ({
  value: u,
  label: u.charAt(0).toUpperCase() + u.slice(1),
}))

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    supplier_id: '',
    description: '',
    prices: [0, 0, 0, 0],
    costs: [0, 0, 0, 0],
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, supRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch('/api/admin/suppliers?active=true'),
          fetch('/api/admin/categories'),
        ])

        if (prodRes.ok) {
          const { product: p } = await prodRes.json()
          setProduct(p)
          setForm({
            name: p.name,
            sku: p.sku,
            category: p.category,
            unit: p.unit,
            supplier_id: p.supplier_id ?? '',
            description: p.description ?? '',
            prices: p.prices,
            costs: p.costs,
            is_active: p.is_active,
            is_featured: p.is_featured ?? false,
          })
        }

        if (supRes.ok) {
          const sups = await supRes.json()
          setSuppliers(Array.isArray(sups) ? sups : sups.suppliers ?? [])
        }

        if (catRes.ok) {
          const cats = await catRes.json()
          const arr = Array.isArray(cats) ? cats : []
          setCategories(arr.filter((c: { is_active: boolean }) => c.is_active).map((c: { name: string }) => ({ value: c.name, label: c.name })))
        }
      } catch {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  function updateField(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateTier(field: 'prices' | 'costs', index: number, value: string) {
    setForm((prev) => {
      const arr = [...prev[field]]
      arr[index] = parseFloat(value) || 0
      return { ...prev, [field]: arr }
    })
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
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
          is_active: form.is_active,
          is_featured: form.is_featured,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save')
      }

      const { product: updated } = await res.json()
      setProduct(updated)
      setSuccess('Product saved successfully')
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

      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Upload failed')
      }

      const { imageUrl } = await res.json()
      setProduct((prev) => prev ? { ...prev, image_url: imageUrl } : prev)
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
    setError(null)

    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove image')

      setProduct((prev) => prev ? { ...prev, image_url: null } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-steel-400">Product not found</p>
        <Link href="/admin/products" className="text-accent-purple hover:underline text-sm mt-2 inline-block">
          Back to products
        </Link>
      </div>
    )
  }

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))
  const margin = form.prices[0] > 0
    ? (((form.prices[0] - form.costs[0]) / form.prices[0]) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        <h1 className="text-2xl font-bold text-white flex-1">{product.name}</h1>
        <Badge variant={product.is_active ? 'accent' : 'default'}>
          {product.is_active ? 'Active' : 'Inactive'}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form — left 2 cols */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
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
                  options={categories}
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
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-steel-400">
                  Tier 1 Margin: <span className="text-white font-semibold">{margin}%</span>
                  {' '}({formatCurrency(form.prices[0] - form.costs[0])} per unit)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
                />
                <span className="text-sm text-steel-300">Product is active and visible in catalog</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
                />
                <span className="text-sm text-steel-300">Featured product (appears at top of catalog)</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/admin/products">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>

        {/* Sidebar — right col */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.image_url ? (
                <div className="relative">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full aspect-[4/3] rounded-xl object-cover"
                  />
                  <button
                    onClick={handleImageRemove}
                    disabled={uploadingImage}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-500/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2">
                  <Package className="h-10 w-10 text-steel-600" />
                  <p className="text-xs text-steel-500">No image</p>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-steel-300 hover:border-accent-purple/40 hover:text-white transition-colors">
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
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
                <span className="font-mono text-steel-300">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Category</span>
                <span className="text-steel-300">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Created</span>
                <span className="text-steel-300">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-500">Updated</span>
                <span className="text-steel-300">
                  {new Date(product.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
