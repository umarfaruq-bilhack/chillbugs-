import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const collab_id = formData.get('collab_id') as string

  if (!file || !collab_id) {
    return NextResponse.json({ error: 'File and collab_id are required' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `collab-${collab_id}-${Date.now()}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabaseAdmin.storage
    .from('collab-docs')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('collab-docs')
    .getPublicUrl(fileName)

  // Update collab application with document URL
  await supabaseAdmin
    .from('collab_applications')
    .update({ document_url: publicUrl })
    .eq('id', collab_id)

  return NextResponse.json({ success: true, url: publicUrl })
}
