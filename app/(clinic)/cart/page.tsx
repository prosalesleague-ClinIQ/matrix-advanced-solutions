'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartContext } from '@/providers/cart-provider'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { CartSummary } from '@/components/cart/cart-summary'
import { ShippingSelector } from '@/components/cart/shipping-selector'
import { Button } from '@/components/ui/button'
import { SHIPPING_METHODS } from '@/lib/constants'

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    itemCount,
    subtotal,
    shippingCost,
    shippingMethod,
    total,
    hydrated,
    updateQuantity,
    removeItem,
    setShippingMethod,
  } = useCartContext()

  const itemList = Object.values(items)
  const shippingLabel = SHIPPING_METHODS[shippingMethod].label

  function handleCheckout() {
    router.push('/checkout')
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-purple" />
        </div>
      </div>
    )
  }

  if (itemList.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-steel-500" />
          <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
          <p className="mt-2 text-steel-400">
            Browse our catalog to find products for your clinic.
          </p>
          <Link href="/catalog">
            <Button variant="primary" size="lg" className="mt-6">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-white sm:text-4xl">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items + shipping */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="space-y-3">
            {itemList.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Shipping */}
          <ShippingSelector
            selected={shippingMethod}
            onSelect={setShippingMethod}
          />
        </div>

        {/* Summary sidebar */}
        <div>
          <CartSummary
            itemCount={itemCount}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            shippingLabel={shippingLabel}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  )
}
