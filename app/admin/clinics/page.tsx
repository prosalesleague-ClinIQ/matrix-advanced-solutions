import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import { ONBOARDING_STATUS_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

export default async function AdminClinicsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: clinics } = await supabase
    .from('clinics')
    .select('id, name, primary_contact_name, primary_email, tier, completed_order_count, wire_verified, onboarding_status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Clinics</h1>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Contact</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Tier</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Orders</th>
                <th className="px-6 py-4 text-center font-medium text-steel-500">Wire Verified</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Onboarding</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clinics?.map((clinic) => (
                <tr
                  key={clinic.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/clinics/${clinic.id}`}
                      className="text-accent-purple hover:text-accent-purple-light font-medium"
                    >
                      {clinic.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-steel-300">{clinic.primary_contact_name}</div>
                    <div className="text-xs text-steel-500">{clinic.primary_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="accent">{clinic.tier}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-steel-300">
                    {clinic.completed_order_count}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {clinic.wire_verified ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-steel-600" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {ONBOARDING_STATUS_LABELS[clinic.onboarding_status] ?? clinic.onboarding_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-steel-400">{formatDate(clinic.created_at)}</td>
                </tr>
              ))}
              {(!clinics || clinics.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-steel-500">
                    No clinics found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
