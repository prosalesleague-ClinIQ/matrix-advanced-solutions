'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartContext } from '@/providers/cart-provider'
import { formatCurrency } from '@/lib/format'

export function CatalogCartButton() {
  const { itemCount, subtotal, hydrated } = useCartContext()

  if (!hydrated) return null

  return (
    <Link
      href="/cart"
      className="group inline-flex items-center gap-3 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_16px_rgba(168,85,247,0.25)] transition-all hover:border-accent-purple hover:bg-accent-purple/20"
    >
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-purple px-1 text-[10px] font-bold text-white ring-2 ring-navy-950">
            {itemCount}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">
        {itemCount === 0
          ? 'Cart is empty'
          : `${itemCount} item${itemCount === 1 ? '' : 's'} · ${formatCurrency(subtotal)}`}
      </span>
      <span className="inline sm:hidden">
        {itemCount === 0 ? 'Cart' : `Cart · ${formatCurrency(subtotal)}`}
      </span>
    </Link>
  )
}
