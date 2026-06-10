import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.x_id) {
    redirect('/')
  }

  // Fetch full user data from Supabase
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('x_id', session.user.x_id)
    .single()

  if (!user) redirect('/')

  // Fetch user rank
  const { count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('bug_points', user.bug_points)

  const rank = (count ?? 0) + 1

  // Fetch recent activities
  const { data: activities } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch total referral count separately so it's always accurate
  const { count: referralCount } = await supabaseAdmin
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'referral')
    .eq('points_earned', 40)

  // Fetch leaderboard top 10
  const { data: leaderboard } = await supabaseAdmin
    .from('users')
    .select('x_username, x_avatar_url, bug_points, wallet_address, referred_by')
    .order('bug_points', { ascending: false })
    .limit(10)

  // Fetch platform settings - only boolean feature flags
  const { data: settingsData } = await supabaseAdmin
    .from('platform_settings')
    .select('key, value')
    .not('key', 'like', '%_url')

  const settings: Record<string, boolean> = {}
  settingsData?.forEach(s => { settings[s.key] = s.value })

  return (
    <DashboardClient
      user={user}
      rank={rank}
      activities={activities || []}
      leaderboard={leaderboard || []}
      referralCount={referralCount ?? 0}
      settings={settings}
    />
  )
}
