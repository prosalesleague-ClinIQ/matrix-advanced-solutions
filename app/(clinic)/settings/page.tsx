'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import { useClinic } from '@/hooks/use-clinic'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreditCard, Truck, Save, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { profile } = useUser()
  const { clinic, refetch } = useClinic(profile?.clinic_id)

  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxId, setTaxId] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (clinic) {
      setName(clinic.name ?? '')
      setContactName(clinic.primary_contact_name ?? '')
      setEmail(clinic.primary_email ?? '')
      setPhone(clinic.primary_phone ?? '')
      setAddress(clinic.business_address ?? '')
      setTaxId(clinic.tax_id ?? '')
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
          name,
          primary_contact_name: contactName,
          primary_email: email,
          primary_phone: phone || null,
          business_address: address || null,
          tax_id: taxId || null,
        })
        .eq('id', clinic.id)

      if (error) throw error

      await refetch()
      setMessage({ type: 'success', text: 'Settings saved successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
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
      <h1 className="text-3xl font-bold text-white">Clinic Settings</h1>

      {/* Sub-navigation */}
      <div className="flex gap-3">
        <Link href="/settings/payment">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </Button>
        </Link>
        <Link href="/settings/shipping">
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4" />
            Shipping Address
          </Button>
        </Link>
      </div>

      {/* Billing Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="clinic-name"
              label="Clinic Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="contact-name"
              label="Contact Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="phone"
              label="Primary Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                id="address"
                label="Business Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Input
              id="tax-id"
              label="Tax ID"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </div>

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
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
