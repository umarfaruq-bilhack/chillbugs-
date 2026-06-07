import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('x_id', session.user.x_id).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check they have an approved collab
  const { data: collab } = await supabaseAdmin
    .from('collab_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .single()

  if (!collab) return NextResponse.json({ error: 'No approved collaboration found' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })

  const allowedTypes = ['text/csv', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|pdf|doc|docx)$/i)) {
    return NextResponse.json({ error: 'Only CSV, Excel, PDF or Word files allowed' }, { status: 400 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `winners-${collab.id}-${Date.now()}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabaseAdmin.storage
    .from('collab-docs')
    .upload(fileName, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from('collab-docs').getPublicUrl(fileName)

  await supabaseAdmin
    .from('collab_applications')
    .update({ winners_url: publicUrl })
    .eq('id', collab.id)

  return NextResponse.json({ success: true, url: publicUrl })
}
