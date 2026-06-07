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

  const { data } = await supabaseAdmin
    .from('art_submissions')
    .select('*, users(x_username, x_avatar_url, bug_points)')
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status, points_awarded, admin_note } = await req.json()

  const { data: submission } = await supabaseAdmin
    .from('art_submissions')
    .select('*, users(id, bug_points, x_username)')
    .eq('id', id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // Update submission status
  await supabaseAdmin
    .from('art_submissions')
    .update({ status, points_awarded: points_awarded || 0, admin_note })
    .eq('id', id)

  // Award points if approved
  if (status === 'approved' && points_awarded > 0 && submission.status !== 'approved') {
    await supabaseAdmin
      .from('users')
      .update({ bug_points: submission.users.bug_points + points_awarded })
      .eq('id', submission.users.id)

    await supabaseAdmin
      .from('activities')
      .insert({
        user_id: submission.users.id,
        type: 'art_contest',
        points_earned: points_awarded,
      })
  }

  return NextResponse.json({ success: true })
}
