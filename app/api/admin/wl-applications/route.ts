import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, count } = await supabaseAdmin
    .from('wl_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const pending = data?.filter(a => a.status === 'pending').length || 0
  const approved = data?.filter(a => a.status === 'approved').length || 0

  return NextResponse.json({ applications: data || [], total: count, pending, approved })
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await req.json()

  await supabaseAdmin
    .from('wl_applications')
    .update({ status })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
