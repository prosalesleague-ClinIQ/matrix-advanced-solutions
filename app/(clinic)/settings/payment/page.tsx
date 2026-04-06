'use client'

import { useUser } from '@/hooks/use-user'
import { useClinic } from '@/hooks/use-clinic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CLINIC_TIERS } from '@/lib/constants'
import { Banknote, CreditCard, Building2, Lock, Loader2 } from 'lucide-react'

export default function PaymentMethodsPage() {
  const { profile } = useUser()
  const { clinic } = useClinic(profile?.clinic_id)

  if (!profile || !clinic) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-steel-500" />
      </div>
    )
  }

  const isNew = clinic.tier === 'new'
  const tierInfo = CLINIC_TIERS[clinic.tier]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Payment Methods</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Tier</CardTitle>
            <Badge variant="accent">{tierInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-steel-400">{tierInfo.description}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Wire Transfer - always available */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15">
                <Banknote className="h-5 w-5 text-accent-purple-light" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Wire Transfer</p>
                <p className="text-xs text-steel-400">
                  Available for all clinic tiers
                </p>
              </div>
              <Badge variant="accent">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card Payment */}
        <Card className={isNew ? 'opacity-60' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <CreditCard className="h-5 w-5 text-steel-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Credit / Debit Card</p>
                <p className="text-xs text-steel-400">
                  {isNew
                    ? 'Available after first completed order'
                    : 'Enabled for returning clinics'}
                </p>
              </div>
              {isNew ? (
                <Lock className="h-5 w-5 text-steel-500" />
              ) : (
                <Badge variant={clinic.card_enabled ? 'accent' : 'default'}>
                  {clinic.card_enabled ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ACH */}
        <Card className={isNew ? 'opacity-60' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Building2 className="h-5 w-5 text-steel-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">ACH Bank Transfer</p>
                <p className="text-xs text-steel-400">
                  {isNew
                    ? 'Available after first completed order'
                    : 'Enabled for returning clinics'}
                </p>
              </div>
              {isNew ? (
                <Lock className="h-5 w-5 text-steel-500" />
              ) : (
                <Badge variant={clinic.ach_enabled ? 'accent' : 'default'}>
                  {clinic.ach_enabled ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
