'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export function SignInButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user) return
    if (typeof window === 'undefined') return
    if (window.location.pathname !== '/') return

    // Only redirect new users (created within last 60 seconds)
    const createdAt = (session.user as any)?.created_at
    if (createdAt) {
      const isNewUser = Date.now() - new Date(createdAt).getTime() < 60000
      if (isNewUser) {
        router.push('/dashboard')
      }
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <button disabled className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-6 py-4 opacity-50 cursor-not-allowed w-full">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <span className="text-white/60 font-medium">Loading...</span>
      </button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#00ff87]/30 rounded-2xl px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <Image src={session.user.image} alt="avatar" width={36} height={36} className="rounded-full" />
          )}
          <div>
            <p className="text-sm text-white/50">Signed in as</p>
            <p className="font-medium text-white">@{(session.user as any)?.x_username || session.user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff87]" />
          <span className="text-[#00ff87] text-sm font-medium">Connected</span>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('twitter')}
      className="flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-black rounded-2xl px-6 py-4 font-semibold transition-all duration-200 hover:scale-[1.02] w-full"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Sign in with X
    </button>
  )
}
