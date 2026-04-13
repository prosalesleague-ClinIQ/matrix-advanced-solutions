'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { ONBOARDING_STATUS_LABELS, PRACTICE_TYPE_OPTIONS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

const onboardingStatusColors: Record<string, string> = {
  submitted: 'bg-accent-blue/15 text-accent-blue-light',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  pending: 'bg-steel-600/20 text-steel-400',
}

interface ClinicData {
  id: string
  name: string
  primary_contact_name: string
  primary_email: string
  primary_phone: string | null
  business_address: string | null
  shipping_address: string | null
  tax_id: string | null
  practice_type: string | null
  medical_license: string | null
  npi_number: string | null
  assigned_rep_id: string | null
  onboarding_status: string
  onboarding_submitted_at: string | null
  onboarding_reviewed_at: string | null
  onboarding_reviewed_by: string | null
  onboarding_rejection_reason: string | null
}

export default function AdminOnboardingDetailPage() {
  const params = useParams<{ id: string }>()
  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', params.id)
        .single()
      setClinic(data as ClinicData | null)
    }
    load()
  }, [params.id])

  const [reviewError, setReviewError] = useState<string | null>(null)

  async function handleReview(action: 'approve' | 'reject') {
    const reason =
      action === 'reject' ? window.prompt('Rejection reason:') : null
    if (action === 'reject' && !reason) return

    setLoading(true)
    setReviewError(null)
    try {
      const res = await fetch('/api/admin/onboarding/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: params.id,
          action,
          reason,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to update clinic')
      }

      // Reload clinic data
      const supabase = createClient()
      const { data } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', params.id)
        .single()
      setClinic(data as ClinicData | null)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const practiceLabel =
    PRACTICE_TYPE_OPTIONS.find((p) => p.value === clinic?.practice_type)?.label ??
    clinic?.practice_type

  if (!clinic) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-steel-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/onboarding"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Onboarding
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">{clinic.name}</h1>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${onboardingStatusColors[clinic.onboarding_status] ?? 'bg-white/10 text-steel-300'}`}
          >
            {ONBOARDING_STATUS_LABELS[clinic.onboarding_status] ?? clinic.onboarding_status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-steel-500">Contact Name</dt>
                <dd className="text-white">{clinic.primary_contact_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500">Email</dt>
                <dd className="text-white">{clinic.primary_email}</dd>
              </div>
              {clinic.primary_phone && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Phone</dt>
                  <dd className="text-white">{clinic.primary_phone}</dd>
                </div>
              )}
              {clinic.business_address && (
                <div>
                  <dt className="text-steel-500 mb-1">Business Address</dt>
                  <dd className="text-steel-300 whitespace-pre-line">
                    {clinic.business_address}
                  </dd>
                </div>
              )}
              {clinic.tax_id && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Tax ID</dt>
                  <dd className="text-white font-mono">{clinic.tax_id}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            {clinic.shipping_address ? (
              <p className="text-sm text-steel-300 whitespace-pre-line">
                {clinic.shipping_address}
              </p>
            ) : (
              <p className="text-sm text-steel-500">No shipping address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {clinic.practice_type && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Practice Type</dt>
                  <dd className="text-white">{practiceLabel}</dd>
                </div>
              )}
              {clinic.medical_license && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Medical License</dt>
                  <dd className="text-white font-mono">{clinic.medical_license}</dd>
                </div>
              )}
              {clinic.npi_number && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">NPI Number</dt>
                  <dd className="text-white font-mono">{clinic.npi_number}</dd>
                </div>
              )}
              {clinic.assigned_rep_id && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Assigned Rep ID</dt>
                  <dd className="text-steel-300 font-mono text-xs">{clinic.assigned_rep_id}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Review Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {clinic.onboarding_submitted_at && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Submitted</dt>
                  <dd className="text-white">
                    {formatDateTime(clinic.onboarding_submitted_at)}
                  </dd>
                </div>
              )}
              {clinic.onboarding_reviewed_at && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Reviewed</dt>
                  <dd className="text-white">
                    {formatDateTime(clinic.onboarding_reviewed_at)}
                  </dd>
                </div>
              )}
              {clinic.onboarding_reviewed_by && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Reviewed By</dt>
                  <dd className="text-steel-300 font-mono text-xs">
                    {clinic.onboarding_reviewed_by}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Reason */}
      {clinic.onboarding_status === 'rejected' && clinic.onboarding_rejection_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-steel-300">{clinic.onboarding_rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {clinic.onboarding_status === 'submitted' && (
        <div className="space-y-3">
          {reviewError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {reviewError}
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={() => handleReview('approve')} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReview('reject')}
              disabled={loading}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
