'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductFormDialog } from '@/components/admin/product-form-dialog'
import type { Product } from '@/lib/types/database'

interface ProductActionsProps {
  product: Product
  onUpdate: () => void
}

export function ProductActions({ product, onUpdate }: ProductActionsProps) {
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch('/api/admin/suppliers?active=true')
      .then((res) => res.json())
      .then((data) => setSuppliers(data.suppliers ?? data ?? []))
      .catch(() => {})
  }, [])

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active }),
      })
      if (res.ok) onUpdate()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ProductFormDialog
        product={product}
        suppliers={suppliers}
        onSuccess={onUpdate}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggling}
      >
        {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
        {product.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  )
}
