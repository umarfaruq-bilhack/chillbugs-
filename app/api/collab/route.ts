import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('x_id', session.user.x_id).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data } = await supabaseAdmin
    .from('collab_applications')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json(data || null)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_name, x_handle, x_profile_url, community_size, description } = await req.json()

  if (!project_name || !x_handle || !x_profile_url || !community_size || !description) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('x_id', session.user.x_id).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check settings
  const { data: setting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'collab_enabled')
    .single()

  if (!setting?.value) {
    return NextResponse.json({ error: 'Collaborations are currently closed' }, { status: 403 })
  }

  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from('collab_applications')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You have already applied for collaboration' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from('collab_applications')
    .insert({ user_id: user.id, project_name, x_handle, x_profile_url, community_size, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })

  return NextResponse.json({ success: true, application: data })
}
