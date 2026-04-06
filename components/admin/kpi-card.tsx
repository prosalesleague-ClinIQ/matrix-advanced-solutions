'use client'

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
}

export function KpiCard({ title, value, description, icon }: KpiCardProps) {
  return (
    <Card variant="glass" className="relative">
      <CardContent>
        {icon && (
          <div className="absolute top-4 right-4 text-steel-500">
            {icon}
          </div>
        )}
        <p className="text-steel-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent mt-1">
          {value}
        </p>
        {description && (
          <p className="text-xs text-steel-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
