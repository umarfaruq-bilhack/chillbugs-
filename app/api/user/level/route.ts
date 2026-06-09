import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.x_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { level } = await req.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, game_level')
    .eq('x_id', session.user.x_id)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Only update if new level is higher
  if (level > user.game_level) {
    await supabaseAdmin
      .from('users')
      .update({ game_level: level })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true, level })
}
