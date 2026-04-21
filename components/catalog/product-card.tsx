'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Check, Package, PackageOpen, ShoppingCart, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TierPricingDisplay } from './tier-pricing-display'
import { useCartContext } from '@/providers/cart-provider'
import { formatCurrency } from '@/lib/format'
import { getUnitPrice } from '@/lib/pricing'
import type { CatalogItem } from './product-grid'

interface ProductCardProps {
  item: CatalogItem
}

export function ProductCard({ item }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCartContext()

  const isBundle = item.kind === 'bundle'
  const unitPrice = getUnitPrice(item.prices, quantity)

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 1800)
    return () => clearTimeout(t)
  }, [justAdded])

  function handleAddToCart() {
    addItem(
      {
        productId: item.id,
        kind: item.kind,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        prices: item.prices,
        costs: item.costs,
      },
      quantity
    )
    setQuantity(1)
    setJustAdded(true)
  }

  const placeholderIcon = isBundle
    ? <PackageOpen className="h-12 w-12 text-steel-500" />
    : <Package className="h-12 w-12 text-steel-500" />

  return (
    <Card variant="interactive" className="flex flex-col bg-surface-card border-white/10">
      {/* Image or placeholder */}
      <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {item.is_featured && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-accent-purple/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}
        {isBundle && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-accent-blue/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <PackageOpen className="h-3 w-3" />
            Bundle
          </div>
        )}
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          placeholderIcon
        )}
      </div>

      {/* Product/bundle info */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{item.name}</h3>
          <p className="text-xs text-steel-500">{item.sku}</p>
        </div>
        <Badge variant="accent" className="shrink-0">{item.category}</Badge>
      </div>

      {/* Bundle contents summary */}
      {isBundle && item.bundle_snapshot && (
        <div className="mb-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-steel-400">
          <p className="font-medium text-steel-300 mb-1">Includes:</p>
          <ul className="space-y-0.5">
            {item.bundle_snapshot.components.map((c) => (
              <li key={c.product_id} className="truncate">
                {c.quantity}× {c.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tier pricing */}
      <div className="mb-4">
        <TierPricingDisplay prices={item.prices} activeQuantity={quantity} />
      </div>

      {/* Unit price display */}
      <div className="mb-4 text-center">
        <span className="text-sm text-steel-400">{isBundle ? 'Bundle price: ' : 'Unit price: '}</span>
        <span className="text-lg font-bold text-white">{formatCurrency(unitPrice)}</span>
        {!isBundle && <span className="text-sm text-steel-500">/{item.unit}</span>}
      </div>

      {/* Quantity + Add to Cart */}
      <div className="mt-auto flex items-center gap-3">
        <div className="flex items-center gap-1">
          <label htmlFor={`qty-${item.id}`} className="sr-only">
            Quantity
          </label>
          <input
            id={`qty-${item.id}`}
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
          className={`flex-1 transition-colors ${
            justAdded ? 'bg-emerald-500 hover:bg-emerald-500' : ''
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
