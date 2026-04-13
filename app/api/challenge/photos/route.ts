import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const VALID_POSITIONS = ['front', 'side', 'back'] as const

type PhotoPosition = (typeof VALID_POSITIONS)[number]

function getExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

function getPhotoColumn(position: PhotoPosition): 'photo_front_url' | 'photo_side_url' | 'photo_back_url' {
  switch (position) {
    case 'front':
      return 'photo_front_url'
    case 'side':
      return 'photo_side_url'
    case 'back':
      return 'photo_back_url'
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const participantId = formData.get('participantId') as string | null
    const weekNumber = formData.get('weekNumber') as string | null
    const position = formData.get('position') as string | null

    // Validate required fields
    if (!file || !participantId || weekNumber === null || !position) {
      return NextResponse.json(
        { error: 'file, participantId, weekNumber, and position are required' },
        { status: 400 }
      )
    }

    // Validate position
    if (!VALID_POSITIONS.includes(position as PhotoPosition)) {
      return NextResponse.json(
        { error: 'position must be front, side, or back' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be JPEG, PNG, or WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File must be under 10MB' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Verify participant belongs to this user
    const { data: participant, error: participantError } = await admin
      .from('challenge_participants')
      .select('id, auth_user_id')
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    if (participant.auth_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const ext = getExtension(file.type)
    const storagePath = `${participantId}/week-${weekNumber}/${position}.${ext}`

    // Delete old file at same path if exists
    await admin.storage.from('challenge-photos').remove([storagePath])

    // Upload file
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from('challenge-photos')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[CHALLENGE_PHOTOS] storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from('challenge-photos')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // Update the corresponding entry's photo URL
    const photoColumn = getPhotoColumn(position as PhotoPosition)
    const weekNum = parseInt(weekNumber, 10)

    await admin
      .from('challenge_entries')
      .update({ [photoColumn]: publicUrl })
      .eq('participant_id', participantId)
      .eq('week_number', weekNum)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Challenge photo upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
