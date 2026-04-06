'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'
import { useClinic } from '@/hooks/use-clinic'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'

export default function ShippingSettingsPage() {
  const { profile } = useUser()
  const { clinic, refetch } = useClinic(profile?.clinic_id)

  const [shippingAddress, setShippingAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (clinic) {
      setShippingAddress(clinic.shipping_address ?? '')
    }
  }, [clinic])

  const handleSave = async () => {
    if (!clinic) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('clinics')
        .update({
          shipping_address: shippingAddress || null,
        })
        .eq('id', clinic.id)

      if (error) throw error

      await refetch()
      setMessage({ type: 'success', text: 'Shipping address updated.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update address. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!profile || !clinic) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-steel-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Shipping Address</h1>

      <Card>
        <CardHeader>
          <CardTitle>Default Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-steel-400">
            This address will be used as the default for new orders.
          </p>

          <Input
            id="shipping-address"
            label="Shipping Address"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="123 Main St, Suite 100, City, State ZIP"
          />

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
