'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupplierFormDialog } from '@/components/admin/supplier-form-dialog'
import type { Supplier } from '@/lib/types/database'

interface SupplierActionsProps {
  supplier: Supplier
  onUpdate: () => void
}

export function SupplierActions({ supplier, onUpdate }: SupplierActionsProps) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !supplier.is_active }),
      })
      if (res.ok) onUpdate()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <SupplierFormDialog supplier={supplier} onSuccess={onUpdate} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggling}
      >
        {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
        {supplier.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  )
}
