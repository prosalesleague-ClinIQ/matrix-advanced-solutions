'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SalesRepFormDialog } from '@/components/admin/sales-rep-form-dialog'
import type { SalesRep } from '@/lib/types/database'

interface SalesRepActionsProps {
  salesRep: SalesRep
  onUpdate: () => void
}

export function SalesRepActions({ salesRep, onUpdate }: SalesRepActionsProps) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/admin/sales-reps/${salesRep.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !salesRep.is_active }),
      })
      if (res.ok) onUpdate()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <SalesRepFormDialog salesRep={salesRep} onSuccess={onUpdate} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggling}
      >
        {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
        {salesRep.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  )
}
