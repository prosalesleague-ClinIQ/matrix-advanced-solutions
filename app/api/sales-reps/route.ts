import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('sales_reps')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
