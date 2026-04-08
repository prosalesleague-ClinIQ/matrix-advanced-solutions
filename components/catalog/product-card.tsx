'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, ShoppingCart, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TierPricingDisplay } from './tier-pricing-display'
import { useCartContext } from '@/providers/cart-provider'
import { formatCurrency } from '@/lib/format'
import { getUnitPrice } from '@/lib/pricing'
import type { Product } from '@/lib/types/database'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartContext()

  const unitPrice = getUnitPrice(product.prices, quantity)

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit: product.unit,
        prices: product.prices,
        costs: product.costs,
      },
      quantity
    )
    setQuantity(1)
  }

  return (
    <Card variant="interactive" className="flex flex-col bg-surface-card border-white/10">
      {/* Product image or placeholder */}
      <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {product.is_featured && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-accent-purple/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Package className="h-12 w-12 text-steel-500" />
        )}
      </div>

      {/* Product info */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{product.name}</h3>
          <p className="text-xs text-steel-500">{product.sku}</p>
        </div>
        <Badge variant="accent" className="shrink-0">{product.category}</Badge>
      </div>

      {/* Tier pricing */}
      <div className="mb-4">
        <TierPricingDisplay prices={product.prices} activeQuantity={quantity} />
      </div>

      {/* Unit price display */}
      <div className="mb-4 text-center">
        <span className="text-sm text-steel-400">Unit price: </span>
        <span className="text-lg font-bold text-white">{formatCurrency(unitPrice)}</span>
        <span className="text-sm text-steel-500">/{product.unit}</span>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="mt-auto flex items-center gap-3">
        <div className="flex items-center gap-1">
          <label htmlFor={`qty-${product.id}`} className="sr-only">
            Quantity
          </label>
          <input
            id={`qty-${product.id}`}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-16 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}
