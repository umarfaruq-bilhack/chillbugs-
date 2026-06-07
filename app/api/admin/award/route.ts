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

  const { user_id, points, reason } = await req.json()

  if (!user_id || !points || points < 1) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('users')
    .update({ bug_points: user.bug_points + points })
    .eq('id', user_id)

  await supabaseAdmin
    .from('activities')
    .insert({
      user_id,
      type: 'referral',
      points_earned: points,
    })

  return NextResponse.json({
    success: true,
    new_total: user.bug_points + points,
    username: user.x_username,
  })
}
