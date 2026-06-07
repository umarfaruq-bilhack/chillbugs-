'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export function ReferralHandler() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [bonusMsg, setBonusMsg] = useState('')

  useEffect(() => {
    // Store referral code in localStorage when user lands on the page
    const ref = searchParams.get('ref')
    if (ref) {
      localStorage.setItem('pending_referral', ref)
    }
  }, [searchParams])

  useEffect(() => {
    // Process referral after user signs in
    const processReferral = async () => {
      if (!session?.user?.x_id) return

      const pendingRef = localStorage.getItem('pending_referral')
      if (!pendingRef) return

      // Clear it immediately to prevent double processing
      localStorage.removeItem('pending_referral')

      try {
        const res = await fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referral_code: pendingRef,
            new_user_x_id: session.user.x_id,
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setBonusMsg(`🎉 You joined via @${data.referrer_username}'s link! +${data.bonus_points} bonus points added!`)
          setTimeout(() => setBonusMsg(''), 5000)
        }
      } catch (e) {
        console.error('Referral processing failed:', e)
      }
    }

    processReferral()
  }, [session])

  if (!bonusMsg) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#00ff87] text-black font-semibold px-6 py-3 rounded-2xl shadow-lg text-sm animate-bounce">
      {bonusMsg}
    </div>
  )
}
