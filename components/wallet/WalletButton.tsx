'use client'

import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected || !address || !session?.user) return
    if (typeof window === 'undefined') return
    if (window.location.pathname !== '/') return

    fetch('/api/user/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: address }),
    }).then(() => {
      // Only redirect new users (created within last 60 seconds)
      const createdAt = (session.user as any)?.created_at
      if (createdAt) {
        const isNewUser = Date.now() - new Date(createdAt).getTime() < 60000
        if (isNewUser) {
          router.push('/dashboard')
        }
      }
    }).catch(console.error)
  }, [isConnected, address, session, router])

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#00ff87]/30 rounded-2xl px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ff87] to-[#00cc6a] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
              <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-white/50">Wallet connected</p>
            <p className="font-medium text-white font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>
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
      onClick={openConnectModal}
      disabled={!session}
      className={`flex items-center justify-center gap-3 rounded-2xl px-6 py-4 font-semibold transition-all duration-200 w-full
        ${session
          ? 'bg-[#00ff87] hover:bg-[#00cc6a] text-black hover:scale-[1.02] glow-btn'
          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-white/30 cursor-not-allowed'
        }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
      {session ? 'Connect Wallet' : 'Sign in with X first'}
    </button>
  )
}
