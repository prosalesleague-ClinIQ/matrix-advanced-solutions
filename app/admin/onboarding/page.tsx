'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { ONBOARDING_STATUS_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const statusTabs = ['all', 'submitted', 'approved', 'rejected'] as const

const onboardingStatusColors: Record<string, string> = {
  submitted: 'bg-accent-blue/15 text-accent-blue-light',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  pending: 'bg-steel-600/20 text-steel-400',
}

interface OnboardingClinic {
  id: string
  name: string
  primary_contact_name: string
  primary_email: string
  onboarding_status: string
  onboarding_submitted_at: string | null
}

export default function AdminOnboardingPage() {
  const [clinics, setClinics] = useState<OnboardingClinic[]>([])
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clinics')
        .select('id, name, primary_contact_name, primary_email, onboarding_status, onboarding_submitted_at')
        .in('onboarding_status', ['submitted', 'approved', 'rejected'])
        .order('onboarding_submitted_at', { ascending: false })
      setClinics((data as OnboardingClinic[]) ?? [])
    }
    load()
  }, [])

  const filtered =
    activeTab === 'all'
      ? clinics
      : clinics.filter((c) => c.onboarding_status === activeTab)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Onboarding</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white/10 text-white'
                : 'text-steel-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all' ? 'All' : (ONBOARDING_STATUS_LABELS[tab] ?? tab)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Clinic Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Contact</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Email</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clinic) => (
                <tr
                  key={clinic.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/onboarding/${clinic.id}`}
                      className="text-accent-purple hover:text-accent-purple-light font-medium"
                    >
                      {clinic.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-steel-300">{clinic.primary_contact_name}</td>
                  <td className="px-6 py-4 text-steel-300">{clinic.primary_email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${onboardingStatusColors[clinic.onboarding_status] ?? 'bg-white/10 text-steel-300'}`}
                    >
                      {ONBOARDING_STATUS_LABELS[clinic.onboarding_status] ?? clinic.onboarding_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-steel-400">
                    {clinic.onboarding_submitted_at
                      ? formatDate(clinic.onboarding_submitted_at)
                      : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel-500">
                    No onboarding applications found
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
