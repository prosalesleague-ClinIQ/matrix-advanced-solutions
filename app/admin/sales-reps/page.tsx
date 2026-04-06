import { Plus } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminSalesRepsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: reps } = await supabase
    .from('sales_reps')
    .select('id, name, email, phone, ghl_user_id, is_active')
    .order('name', { ascending: true })

  // Get clinic counts per rep
  const { data: clinicAssignments } = await supabase
    .from('clinics')
    .select('assigned_rep_id')

  const countMap: Record<string, number> = {}
  clinicAssignments?.forEach((c) => {
    if (c.assigned_rep_id) {
      countMap[c.assigned_rep_id] = (countMap[c.assigned_rep_id] ?? 0) + 1
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Sales Reps</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Rep
        </Button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Email</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Phone</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">GHL User ID</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Clinics</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {reps?.map((rep) => (
                <tr
                  key={rep.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium">{rep.name}</td>
                  <td className="px-6 py-4 text-steel-300">{rep.email ?? '—'}</td>
                  <td className="px-6 py-4 text-steel-300">{rep.phone ?? '—'}</td>
                  <td className="px-6 py-4 font-mono text-xs text-steel-400">
                    {rep.ghl_user_id ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="accent">{countMap[rep.id] ?? 0}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={rep.is_active ? 'accent' : 'default'}>
                      {rep.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!reps || reps.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel-500">
                    No sales reps found
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
