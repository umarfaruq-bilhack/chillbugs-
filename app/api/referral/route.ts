import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { referral_code, new_user_x_id } = await req.json()

  if (!referral_code || !new_user_x_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Find the referrer by referral code
  const { data: referrer } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('referral_code', referral_code)
    .single()

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  }

  // Get the new user
  const { data: newUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('x_id', new_user_x_id)
    .single()

  if (!newUser) {
    return NextResponse.json({ error: 'New user not found' }, { status: 404 })
  }

  // Make sure they're not referring themselves
  if (referrer.id === newUser.id) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  // Make sure this user hasn't already been referred
  if (newUser.referred_by) {
    return NextResponse.json({ error: 'User already referred' }, { status: 409 })
  }

  // Give referrer +40 points
  await supabaseAdmin
    .from('users')
    .update({ bug_points: referrer.bug_points + 40 })
    .eq('id', referrer.id)

  await supabaseAdmin
    .from('activities')
    .insert({
      user_id: referrer.id,
      type: 'referral',
      points_earned: 40,
    })

  // Give new user +10 welcome bonus + mark them as referred
  await supabaseAdmin
    .from('users')
    .update({
      bug_points: newUser.bug_points + 10,
      referred_by: referral_code,
    })
    .eq('id', newUser.id)

  await supabaseAdmin
    .from('activities')
    .insert({
      user_id: newUser.id,
      type: 'referral',
      points_earned: 10,
    })

  return NextResponse.json({
    success: true,
    referrer_username: referrer.x_username,
    bonus_points: 10,
  })
}
