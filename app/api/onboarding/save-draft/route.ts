import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 })
    }

    const body = await request.json()

    const { error } = await supabase
      .from('clinics')
      .update({
        name: body.name,
        primary_contact_name: body.primary_contact_name,
        primary_phone: body.primary_phone,
        business_address: body.business_address,
        tax_id: body.tax_id,
        shipping_address: body.shipping_address,
        practice_type: body.practice_type,
        medical_license: body.medical_license,
        npi_number: body.npi_number,
        assigned_rep_id: body.assigned_rep_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.clinic_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
