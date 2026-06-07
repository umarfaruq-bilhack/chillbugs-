import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .order('bug_points', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('x_username', `%${search}%`)
  }

  const { data: users, count } = await query

  // Stats
  const { count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: wlUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('bug_points', 2000)

  const { count: walletConnected } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('wallet_address', 'is', null)

  return NextResponse.json({
    users: users || [],
    total: count || 0,
    stats: {
      totalUsers: totalUsers || 0,
      wlUsers: wlUsers || 0,
      walletConnected: walletConnected || 0,
    }
  })
}
