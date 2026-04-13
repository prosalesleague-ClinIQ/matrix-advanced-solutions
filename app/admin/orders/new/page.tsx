'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/lib/types/database'

export default function AdminNewOrderClinicPickerPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('clinics')
          .select('*')
          .order('name', { ascending: true })
        setClinics(data ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = clinics.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.primary_contact_name.toLowerCase().includes(q) ||
      c.primary_email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>
        <h1 className="text-2xl font-bold text-white">Place Order on Behalf of Clinic</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Clinic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-500" />
            <Input
              placeholder="Search by clinic, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-steel-500 py-8 text-sm">
              {search ? 'No clinics match your search' : 'No clinics yet'}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/admin/orders/new/${clinic.id}`}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group border border-transparent hover:border-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{clinic.name}</p>
                    <p className="text-xs text-steel-500 truncate">
                      {clinic.primary_contact_name} · {clinic.primary_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={clinic.tier === 'returning' ? 'accent' : 'default'}>
                      {clinic.tier === 'returning' ? 'Returning' : 'New'}
                    </Badge>
                    <Badge variant={clinic.onboarding_status === 'approved' ? 'accent' : 'default'}>
                      {clinic.onboarding_status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
