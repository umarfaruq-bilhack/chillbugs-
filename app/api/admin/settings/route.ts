import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from('platform_settings')
    .select('*')

  const settings: Record<string, boolean> = {}
  data?.forEach(s => { settings[s.key] = s.value })
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key, value } = await req.json()

  await supabaseAdmin
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  return NextResponse.json({ success: true })
}
