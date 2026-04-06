import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/format'

export default async function AdminAuditLogPage() {
  const supabase = await createServerSupabaseClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('id, created_at, action, entity_type, entity_id, user_id, reason')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Audit Log</h1>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Time</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Action</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Entity Type</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Entity ID</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">User ID</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4 text-steel-400 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-steel-300">{log.entity_type}</td>
                  <td className="px-6 py-4 font-mono text-xs text-steel-400">
                    {log.entity_id ?? '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-steel-400">
                    {log.user_id ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-steel-300 max-w-xs truncate">
                    {log.reason ?? '—'}
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel-500">
                    No audit log entries
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
