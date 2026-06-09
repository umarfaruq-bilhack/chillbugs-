import NextAuth from 'next-auth'
import Twitter from 'next-auth/providers/twitter'
import { supabaseAdmin } from '@/lib/supabase'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'twitter') return false

      const twitterProfile = profile as any
      const x_id = twitterProfile.data?.id ?? user.id

      // Check if user already exists
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id, created_at')
        .eq('x_id', x_id)
        .single()

      if (!existing) {
        // New user — insert
        const { error } = await supabaseAdmin
          .from('users')
          .insert({
            x_id,
            x_username: twitterProfile.data?.username ?? user.name,
            x_avatar_url: twitterProfile.data?.profile_image_url ?? user.image,
          })

        if (error) {
          console.error('Supabase insert error:', error)
          return false
        }
      } else {
        // Existing user — just update avatar/username in case they changed
        await supabaseAdmin
          .from('users')
          .update({
            x_username: twitterProfile.data?.username ?? user.name,
            x_avatar_url: twitterProfile.data?.profile_image_url ?? user.image,
          })
          .eq('x_id', x_id)
      }

      return true
    },

    async session({ session, token }) {
      if (token?.sub) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('x_id', token.sub)
          .single()

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.x_id = dbUser.x_id
          session.user.x_username = dbUser.x_username
          session.user.bug_points = dbUser.bug_points
          session.user.streak_count = dbUser.streak_count
          session.user.wallet_address = dbUser.wallet_address
          session.user.referral_code = dbUser.referral_code
          // Pass created_at so client can detect new users
          ;(session.user as any).created_at = dbUser.created_at
        }
      }
      return session
    },

    async jwt({ token, profile }) {
      if (profile) {
        const twitterProfile = profile as any
        token.sub = twitterProfile.data?.id
      }
      return token
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/',
  },
})
