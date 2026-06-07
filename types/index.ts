export interface User {
  id: string
  wallet_address: string
  x_id: string
  x_username: string
  x_avatar_url: string
  bug_points: number
  streak_count: number
  last_checkin: string | null
  referral_code: string
  referred_by: string | null
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: ActivityType
  points_earned: number
  created_at: string
}

export type ActivityType =
  | 'daily_checkin'
  | 'bug_catcher_game'
  | 'lore_quiz'
  | 'referral'
  | 'share_x'

export interface LeaderboardEntry {
  rank: number
  x_username: string
  x_avatar_url: string
  bug_points: number
  wallet_address: string
  referred_by: string | null
}
