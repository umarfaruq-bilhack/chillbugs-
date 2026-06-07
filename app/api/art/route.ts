import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('x_id', session.user.x_id).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data } = await supabaseAdmin
    .from('art_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tweet_url } = await req.json()

  if (!tweet_url || !tweet_url.includes('twitter.com') && !tweet_url.includes('x.com')) {
    return NextResponse.json({ error: 'Please provide a valid X/Twitter tweet URL' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('x_id', session.user.x_id).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check settings
  const { data: setting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'art_contest_enabled')
    .single()

  if (!setting?.value) {
    return NextResponse.json({ error: 'Art contest is currently closed' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('art_submissions')
    .insert({ user_id: user.id, tweet_url, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })

  return NextResponse.json({ success: true, submission: data })
}
