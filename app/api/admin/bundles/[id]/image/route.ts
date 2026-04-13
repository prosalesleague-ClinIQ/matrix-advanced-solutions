import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import type { Json } from '@/lib/types/database'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) return null
  return user
}

function extractStoragePath(url: string): string | null {
  const match = url.match(/product-images\/(.+)$/)
  return match ? match[1] : null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: bundle, error: fetchError } = await admin
      .from('product_bundles')
      .select('id, image_url')
      .eq('id', id)
      .single()

    if (fetchError || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpeg, png, webp' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB' }, { status: 400 })
    }

    // Delete old image if present
    if (bundle.image_url) {
      const oldPath = extractStoragePath(bundle.image_url)
      if (oldPath) {
        await admin.storage.from('product-images').remove([oldPath])
      }
    }

    // Upload new
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `bundles/${id}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from('product-images')
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('[ADMIN_BUNDLE_IMAGE] upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: publicUrlData } = admin.storage
      .from('product-images')
      .getPublicUrl(filePath)

    const imageUrl = publicUrlData.publicUrl

    const { error: updateError } = await admin
      .from('product_bundles')
      .update({ image_url: imageUrl })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update bundle image' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BUNDLE_UPDATED,
      entityType: 'bundle',
      entityId: id,
      beforeState: { image_url: bundle.image_url } as unknown as Json,
      afterState: { image_url: imageUrl } as unknown as Json,
    })

    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('[ADMIN_BUNDLE_IMAGE] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: bundle } = await admin
      .from('product_bundles')
      .select('id, image_url')
      .eq('id', id)
      .single()

    if (bundle?.image_url) {
      const oldPath = extractStoragePath(bundle.image_url)
      if (oldPath) {
        await admin.storage.from('product-images').remove([oldPath])
      }
    }

    await admin.from('product_bundles').update({ image_url: null }).eq('id', id)

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BUNDLE_UPDATED,
      entityType: 'bundle',
      entityId: id,
      beforeState: { image_url: bundle?.image_url ?? null } as unknown as Json,
      afterState: { image_url: null } as unknown as Json,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
