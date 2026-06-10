import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const LEVEL_POINTS: Record<number, number> = {
  1: 50, 2: 60, 3: 75, 4: 90, 5: 110,
  6: 130, 7: 155, 8: 180, 9: 210, 10: 300
}

const TASK_POINTS: Record<string, number> = {
  daily_checkin: 10,
  bug_catcher_game: 50,
  lore_quiz: 30,
  share_x: 25,
  referral: 40,
}

const TASK_SETTING: Record<string, string> = {
  daily_checkin: 'checkin_enabled',
  bug_catcher_game: 'game_enabled',
  lore_quiz: 'quiz_enabled',
  share_x: 'share_x_enabled',
  referral: 'referral_enabled',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.x_id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { type, level } = await req.json()

  if (!TASK_POINTS[type]) {
    return NextResponse.json({ error: 'Invalid task type' }, { status: 400 })
  }

  // Use level-based points for game
  let points = TASK_POINTS[type]
  if (type === 'bug_catcher_game' && level) {
    points = LEVEL_POINTS[level] || 50
  }

  // Check if feature is enabled
  const settingKey = TASK_SETTING[type]
  if (settingKey) {
    const { data: setting } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', settingKey)
      .single()
    if (setting && !setting.value) {
      return NextResponse.json({ error: 'This feature is currently disabled' }, { status: 403 })
    }
  }

  // Get user from DB
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('x_id', session.user.x_id)
    .single()

  if (!user || userError) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Prevent duplicate daily checkins
  if (type === 'daily_checkin') {
    const today = new Date().toISOString().split('T')[0]
    const lastCheckin = user.last_checkin ? user.last_checkin.split('T')[0] : null
    if (lastCheckin === today) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 409 })
    }
  }

  // 7 hour cooldown for lore_quiz
  if (type === 'lore_quiz') {
    const sevenHrsAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabaseAdmin
      .from('activities')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('type', 'lore_quiz')
      .gte('created_at', sevenHrsAgo)
      .single()
    if (existing) {
      const nextAvailable = new Date(new Date(existing.created_at).getTime() + 7 * 60 * 60 * 1000)
      const diff = nextAvailable.getTime() - Date.now()
      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return NextResponse.json({ error: `Quiz on cooldown. Try again in ${hrs}h ${mins}m` }, { status: 409 })
    }
  }

  // Prevent duplicate share_x (once per day)
  if (type === 'share_x') {
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'share_x')
      .gte('created_at', `${today}T00:00:00`)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'Already shared today' }, { status: 409 })
    }
  }

  // Calculate streak for checkin
  let newStreak = user.streak_count
  if (type === 'daily_checkin') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const lastCheckin = user.last_checkin ? user.last_checkin.split('T')[0] : null
    newStreak = lastCheckin === yesterdayStr ? user.streak_count + 1 : 1
  }

  // Update user points
  const updateData: any = { bug_points: user.bug_points + points }
  if (type === 'daily_checkin') {
    updateData.last_checkin = new Date().toISOString()
    updateData.streak_count = newStreak
  }

  await supabaseAdmin.from('users').update(updateData).eq('id', user.id)

  await supabaseAdmin.from('activities').insert({
    user_id: user.id,
    type,
    points_earned: points,
  })

  return NextResponse.json({
    success: true,
    points_earned: points,
    new_total: user.bug_points + points,
    streak: newStreak,
  })
}
