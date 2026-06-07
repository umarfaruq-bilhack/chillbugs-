import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      x_id: string
      x_username: string
      bug_points: number
      streak_count: number
      wallet_address: string | null
      referral_code: string
    } & DefaultSession['user']
  }
}
