'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CategoryFilter } from './category-filter'
import { ProductCard } from './product-card'
import type { BundleSnapshot } from '@/lib/types/database'

/**
 * Unified catalog item shape — covers both products and bundles.
 * `kind` discriminates which one. Bundles carry a `bundle_snapshot`
 * that lists their components for display.
 */
export interface CatalogItem {
  id: string
  kind: 'product' | 'bundle'
  name: string
  sku: string
  category: string
  unit: string
  prices: number[]
  costs: number[]
  image_url: string | null
  is_featured: boolean
  free_shipping?: boolean
  description: string | null
  bundle_snapshot?: BundleSnapshot
}

interface ProductGridProps {
  products: CatalogItem[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)))
    return ['All', ...cats.sort()]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory
      const matchesSearch =
        search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, search])

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-500" />
          <Input
            placeholder="Search products and bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ProductCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-10 w-10 text-steel-500" />
          <p className="text-lg font-medium text-steel-300">No items found</p>
          <p className="mt-1 text-sm text-steel-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}
