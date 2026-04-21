'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import { getUnitPrice, getLineTotal, getTierLabel } from '@/lib/pricing'
import { SHIPPING_METHODS } from '@/lib/constants'
import type { Clinic, Product } from '@/lib/types/database'
import type { ShippingMethod } from '@/lib/constants'

type PaymentMethod = 'wire' | 'card' | 'ach'

interface CartLine {
  productId: string
  product: Product
  quantity: number
}

export default function AdminNewOrderPage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.clinicId as string

  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [cart, setCart] = useState<Record<string, CartLine>>({})

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wire')
  const [overrideTierGate, setOverrideTierGate] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [clinicRes, productsRes] = await Promise.all([
          supabase.from('clinics').select('*').eq('id', clinicId).single(),
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .order('name'),
        ])

        if (clinicRes.data) {
          setClinic(clinicRes.data)
          if (clinicRes.data.shipping_address) {
            setShippingAddress(clinicRes.data.shipping_address)
          }
        }
        if (productsRes.data) {
          setProducts(productsRes.data)
        }
      } catch {
        setError('Failed to load clinic or products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clinicId])

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

  const cartLines = Object.values(cart)
  const subtotal = cartLines.reduce(
    (sum, line) => sum + getLineTotal(line.product.prices, line.quantity),
    0
  )
  const shippingCost = SHIPPING_METHODS[shippingMethod].price
  const total = subtotal + shippingCost

  function addToCart(product: Product) {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        productId: product.id,
        product,
        quantity: (prev[product.id]?.quantity ?? 0) + 1,
      },
    }))
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      const existing = prev[productId]
      if (!existing) return prev
      return {
        ...prev,
        [productId]: { ...existing, quantity },
      }
    })
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const isNewClinic = clinic?.tier === 'new'
  // Card temporarily disabled — wire + ACH only for now.
  const cardLocked = true
  const achLocked = isNewClinic && !overrideTierGate

  async function handleSubmit() {
    if (cartLines.length === 0) {
      setError('Cart is empty')
      return
    }
    if (!shippingAddress.trim() || shippingAddress.trim().length < 10) {
      setError('Shipping address is required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          overrideTierGate,
          items: cartLines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          shippingMethod,
          shippingAddress: shippingAddress.trim(),
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to submit order')
      }

      const data = await res.json()
      setSuccess(`Order ${data.orderNumber} created successfully`)
      setTimeout(() => router.push(`/admin/orders/${data.orderId}`), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="text-center py-20">
        <p className="text-steel-400">Clinic not found</p>
        <Link href="/admin/orders/new" className="text-accent-purple hover:underline text-sm mt-2 inline-block">
          Back to clinic picker
        </Link>
      </div>
    )
  }

  const shippingOptions = Object.entries(SHIPPING_METHODS).map(([value, meta]) => ({
    value,
    label: `${meta.label} — ${formatCurrency(meta.price)}`,
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Clinic
        </Link>
        <h1 className="text-2xl font-bold text-white flex-1">Place Order</h1>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{clinic.name}</p>
          <p className="text-xs text-steel-500">{clinic.primary_email}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl p-3 text-sm text-green-300 bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: product picker */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-500" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1">
                {filteredProducts.map((product) => {
                  const inCart = cart[product.id]
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{product.name}</p>
                        <p className="text-xs text-steel-500 font-mono">{product.sku}</p>
                      </div>
                      <Badge variant="default">{product.category}</Badge>
                      <span className="text-sm text-steel-300 font-medium tabular-nums">
                        {formatCurrency(product.prices[0])}
                      </span>
                      {inCart ? (
                        <Badge variant="accent">×{inCart.quantity}</Badge>
                      ) : (
                        <Plus className="h-4 w-4 text-steel-500" />
                      )}
                    </button>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-steel-500 text-sm py-6">No products match</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle>Cart ({cartLines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cartLines.length === 0 ? (
                <p className="text-center text-steel-500 text-sm py-6">Cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cartLines.map((line) => {
                    const unitPrice = getUnitPrice(line.product.prices, line.quantity)
                    const lineTotal = getLineTotal(line.product.prices, line.quantity)
                    return (
                      <div
                        key={line.productId}
                        className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {line.product.name}
                          </p>
                          <p className="text-xs text-steel-500">
                            {formatCurrency(unitPrice)} · {getTierLabel(line.quantity)} tier
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              updateQuantity(line.productId, parseInt(e.target.value) || 0)
                            }
                            className="w-16 text-center"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <span className="text-sm text-white font-semibold tabular-nums min-w-[5rem] text-right">
                          {formatCurrency(lineTotal)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(line.productId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Shipping Method"
                options={shippingOptions}
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-300">
                  Shipping Address
                </label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 min-h-[80px] resize-y"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full shipping address..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-300">Order Notes</label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950 min-h-[60px] resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes (optional)..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: summary + payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-steel-400">
                <span>Subtotal</span>
                <span className="text-white tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-steel-400">
                <span>Shipping ({SHIPPING_METHODS[shippingMethod].label})</span>
                <span className="text-white tabular-nums">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-white tabular-nums">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isNewClinic && (
                <div className="rounded-xl p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    This is a <strong>new-tier clinic</strong>. Card/ACH normally require a first wire payment. Use override below if accepting payment by phone.
                  </span>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/10 px-4 py-3 hover:border-white/20">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'wire'}
                  onChange={() => setPaymentMethod('wire')}
                  className="text-accent-purple focus:ring-accent-purple"
                />
                <span className="text-sm text-white">Wire Transfer</span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  cardLocked
                    ? 'border-white/5 opacity-50 cursor-not-allowed'
                    : 'border-white/10 cursor-pointer hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="pm"
                  disabled={cardLocked}
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="text-accent-purple focus:ring-accent-purple"
                />
                <span className="text-sm text-white">Credit Card (Stripe)</span>
                <span className="ml-auto rounded-full bg-accent-blue/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-blue-light">
                  Coming Soon
                </span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  achLocked
                    ? 'border-white/5 opacity-50 cursor-not-allowed'
                    : 'border-white/10 cursor-pointer hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="pm"
                  disabled={achLocked}
                  checked={paymentMethod === 'ach'}
                  onChange={() => setPaymentMethod('ach')}
                  className="text-accent-purple focus:ring-accent-purple"
                />
                <span className="text-sm text-white">ACH</span>
              </label>

              {isNewClinic && (
                <label className="flex items-center gap-3 cursor-pointer mt-2 pt-2 border-t border-white/10">
                  <input
                    type="checkbox"
                    checked={overrideTierGate}
                    onChange={(e) => {
                      setOverrideTierGate(e.target.checked)
                      if (!e.target.checked && (paymentMethod === 'card' || paymentMethod === 'ach')) {
                        setPaymentMethod('wire')
                      }
                    }}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent-purple focus:ring-accent-purple focus:ring-offset-navy-950"
                  />
                  <span className="text-xs text-steel-300">
                    Override tier gate (allow card/ACH for this new clinic)
                  </span>
                </label>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || cartLines.length === 0}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Submitting...' : `Place Order · ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
