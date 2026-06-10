'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { User, Activity, LeaderboardEntry } from '@/types'
import { shortWallet, formatPoints } from '@/lib/utils'

interface Props {
  user: User
  rank: number
  activities: Activity[]
  leaderboard: LeaderboardEntry[]
  referralCount: number
}

const TASKS = [
  { id: 'daily_checkin', icon: '📅', title: 'Daily Check-in', desc: 'Tap your bug to keep your streak alive', pts: 10, tag: 'Daily', available: true },
  { id: 'bug_catcher_game', icon: '🎮', title: 'Bug Catcher', desc: 'Catch 10 bugs in under 30 seconds', pts: 50, tag: 'Game', available: true },
  { id: 'lore_quiz', icon: '❓', title: 'Lore Quiz', desc: 'Answer 5 questions about the Chill Bugs universe', pts: 30, tag: 'Quest', available: true },
  { id: 'share_x', icon: '🐦', title: 'Share on X', desc: 'Share your referral link on X', pts: 25, tag: 'Social', available: true },
  { id: 'referral', icon: '👥', title: 'Refer a Friend', desc: 'Invite friends using your referral link', pts: 40, tag: 'Referral', available: true },
]

const ACTIVITY_LABELS: Record<string, string> = {
  daily_checkin: 'Daily Check-in',
  bug_catcher_game: 'Bug Catcher Game',
  lore_quiz: 'Lore Quiz',
  share_x: 'Shared on X',
  referral: 'Referral Bonus',
}

export function DashboardClient({ user, rank, activities, leaderboard, referralCount }: Props) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'activity'>('tasks')
  const [copied, setCopied] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const todayDate = new Date().toISOString().split('T')[0]
  const alreadyCheckedIn = user.last_checkin ? user.last_checkin.split('T')[0] === todayDate : false
  const [checkinDone, setCheckinDone] = useState(alreadyCheckedIn)
  const [checkinMsg, setCheckinMsg] = useState(alreadyCheckedIn ? 'Come back tomorrow!' : '')
  const [showReferrals, setShowReferrals] = useState(false)
  const todayStr = new Date().toISOString().split('T')[0]
  const alreadySharedToday = activities.some(a => a.type === 'share_x' && a.created_at && a.created_at.split('T')[0] === todayStr)
  const [shareState, setShareState] = useState<'idle' | 'counting' | 'claiming' | 'done'>(alreadySharedToday ? 'done' : 'idle')
  const [shareCountdown, setShareCountdown] = useState(5)
  const { address } = useAccount()
  const router = useRouter()

  const wlProgress = Math.min((user.bug_points / 2000) * 100, 100)
  const isTop50 = rank <= 50
  const hasWL = user.bug_points >= 2000

  const handleShare = () => {
    const text = `Just joined @TheChillBugs playground 🐛\n\nEarn your WL spot by:\n🎮 Playing Bug Catcher\n📅 Daily check-ins & quizzes\n🎨 Creating bug art & tagging us\n👥 Referring friends\n\nJoin here: ${window.location.origin}?ref=${user.referral_code}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    setShareState('counting')
    setShareCountdown(5)
    const interval = setInterval(() => {
      setShareCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          claimSharePoints()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const claimSharePoints = async () => {
    setShareState('claiming')
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'share_x' }),
      })
      if (res.ok) {
        setShareState('done')
        setTimeout(() => router.refresh(), 1500)
      } else {
        setShareState('done')
      }
    } catch {
      setShareState('done')
    }
  }

  const handleCheckin = async () => {
    setCheckinLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily_checkin' }),
      })
      const data = await res.json()
      if (res.ok) {
        setCheckinDone(true)
        setCheckinMsg(`+10 pts! Streak: ${data.streak} days 🔥`)
        setTimeout(() => router.refresh(), 1500)
      } else {
        setCheckinMsg(data.error || 'Already checked in today!')
        setCheckinDone(true)
      }
    } finally {
      setCheckinLoading(false)
    }
  }

  const copyReferral = () => {
    const link = `${window.location.origin}?ref=${user.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnX = () => {
    const text = `Just joined @TheChillBugs playground 🐛\n\nEarn your WL spot by:\n🎮 Playing Bug Catcher\n📅 Daily check-ins & quizzes\n🎨 Creating bug art & tagging us\n👥 Referring friends\n\nJoin here: ${window.location.origin}?ref=${user.referral_code}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-bg">

      {/* Referrals popup */}
      {showReferrals && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowReferrals(false)}>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-black text-white text-xl">Your Referrals</h2>
                <p className="text-white/40 text-sm mt-0.5">{referralCount} friend{referralCount !== 1 ? 's' : ''} joined through your link</p>
              </div>
              <button onClick={() => setShowReferrals(false)} className="text-white/30 hover:text-white/60 text-xl transition-colors">✕</button>
            </div>
            {referralCount === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-white/40 text-sm">No referrals yet</p>
                <p className="text-white/30 text-xs mt-1">Share your link to earn +40 pts per friend!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.filter(e => e.referred_by === user.referral_code).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0a0a0a] rounded-2xl p-3">
                    {entry.x_avatar_url ? (
                      <Image src={entry.x_avatar_url} alt="avatar" width={36} height={36} className="rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white/30 text-sm">?</div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">@{entry.x_username}</p>
                      <p className="text-white/40 text-xs">{formatPoints(entry.bug_points)} Bug Points</p>
                    </div>
                    <span className="text-[#00ff87] text-xs font-semibold">+40 pts earned</span>
                  </div>
                ))}
                {referralCount > leaderboard.filter(e => e.referred_by === user.referral_code).length && (
                  <p className="text-white/30 text-xs text-center pt-2">Some referrals may not be in the top 10 leaderboard</p>
                )}
              </div>
            )}
            <div className="mt-5 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-2xl p-4 text-center">
              <p className="text-[#00ff87] font-semibold text-sm">Total earned from referrals</p>
              <p className="font-display font-black text-2xl text-[#00ff87] mt-1">+{referralCount * 40} Bug Points</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🐛</span>
            <span className="font-display font-bold text-base tracking-tight">CHILL BUGS</span>
          </a>
          <div className="flex items-center gap-3">
            {user.x_avatar_url && (
              <Image src={user.x_avatar_url} alt="avatar" width={32} height={32} className="rounded-full" />
            )}
            <span className="text-white/60 text-sm hidden sm:block">@{user.x_username}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-white/30 hover:text-white/60 transition-colors border border-[#2a2a2a] rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">

      {/* Referral welcome banner */}
        {user.referred_by && activities.some(a => a.type === 'referral') && !localStorage.getItem(`ref_banner_seen_${user.id}`) && (
          <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-[#00ff87] font-semibold text-sm">Welcome bonus applied!</p>
                <p className="text-white/50 text-xs">You joined via a referral link and got +10 bonus Bug Points</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem(`ref_banner_seen_${user.id}`, 'true')
                window.location.reload()
              }}
              className="text-white/30 hover:text-white/60 text-lg transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Bug Points', value: formatPoints(user.bug_points), icon: '⚡', color: 'text-[#00ff87]' },
            { label: 'Rank', value: `#${rank}`, icon: '🏆', color: rank <= 50 ? 'text-[#00ff87]' : 'text-white' },
            { label: 'Streak', value: `${user.streak_count}d`, icon: '🔥', color: 'text-orange-400' },
            { label: 'WL Status', value: hasWL ? '✅ WL' : 'Pending', icon: '💎', color: hasWL ? 'text-[#00ff87]' : 'text-orange-400' },          ].map((stat) => (
            <div key={stat.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-3 md:p-4 overflow-hidden text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-base">{stat.icon}</span>
                <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-wider truncate">{stat.label}</span>
              </div>
              <div className={`font-display font-black text-lg md:text-2xl truncate ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* WL Progress bar */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white font-semibold text-sm">Whitelist Progress</span>
              {hasWL && (
                <span className="text-xs bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 px-2 py-0.5 rounded-full">
                  🎉 Guaranteed WL
                </span>
              )}
            </div>
            <span className="text-white/40 text-xs">{user.bug_points} / 2000 pts</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff87] to-[#00cc6a] rounded-full transition-all duration-500"
              style={{ width: `${wlProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-white/30 text-xs">0</span>
            <span className="text-white/30 text-xs">2000 pts = WL guaranteed</span>
          </div>
        </div>

        {/* Profile + referral card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full min-w-0">

          {/* Profile card */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Your Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              {user.x_avatar_url && (
                <Image src={user.x_avatar_url} alt="avatar" width={48} height={48} className="rounded-full" />
              )}
              <div>
                <div className="font-semibold text-white">@{user.x_username}</div>
                <div className="text-white/40 text-xs mt-0.5 font-mono">
                  {user.wallet_address ? shortWallet(user.wallet_address) : 'No wallet linked'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="font-display font-black text-lg text-white">{formatPoints(user.bug_points)}</div>
                <div className="text-white/40 text-xs mt-0.5">Bug Points</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="font-display font-black text-lg text-white">#{rank}</div>
                <div className="text-white/40 text-xs mt-0.5">Global Rank</div>
              </div>
              <button
                onClick={() => setShowReferrals(true)}
                className="bg-[#0a0a0a] rounded-xl p-3 text-center hover:bg-[#00ff87]/10 transition-colors"
              >
                <div className="font-display font-black text-lg text-[#00ff87]">{referralCount}</div>
                <div className="text-white/40 text-xs mt-0.5">Referrals 👆</div>
              </button>
            </div>
          </div>

          {/* Referral card */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Your Referral Link</h3>
            <p className="text-white/50 text-sm mb-4">
              Each friend who joins through your link earns you <span className="text-[#00ff87] font-semibold">+40 Bug Points</span>
            </p>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-3 font-mono text-xs text-white/50 mb-3 overflow-hidden text-ellipsis whitespace-nowrap w-full">
              chillbugs.xyz?ref={user.referral_code}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReferral}
                className="flex-1 bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button
                onClick={shareOnX}
                className="flex-1 bg-white hover:bg-white/90 text-black rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111111] border border-[#2a2a2a] rounded-2xl p-1 mb-6">
          {(['tasks', 'leaderboard', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize
                ${activeTab === tab
                  ? 'bg-[#00ff87] text-black'
                  : 'text-white/40 hover:text-white/70'
                }`}
            >
              {tab === 'tasks' ? '🎯 Tasks' : tab === 'leaderboard' ? '🏆 Leaderboard' : '📋 Activity'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TASKS.map((task) => (
              <div key={task.id} className="bg-[#111111] border border-[#2a2a2a] hover:border-[#00ff87]/30 rounded-2xl p-5 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{task.icon}</span>
                  <span className="text-xs font-medium text-white/30 bg-white/5 px-2 py-1 rounded-full">{task.tag}</span>
                </div>
                <h3 className="font-display font-black text-white text-lg mb-1">{task.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">{task.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#00ff87] text-sm font-semibold">+{task.pts} pts</span>
                  {task.id === 'daily_checkin' && (
                    <button
                      onClick={handleCheckin}
                      disabled={checkinLoading || checkinDone}
                      className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {checkinLoading ? '...' : checkinDone ? checkinMsg : 'Check In'}
                    </button>
                  )}
                  {task.id === 'bug_catcher_game' && (
                    <a href="/dashboard/game" className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl px-4 py-2 text-xs font-medium transition-colors">
                      Play Now
                    </a>
                  )}
                  {task.id === 'lore_quiz' && (
                    <a href="/dashboard/quiz" className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl px-4 py-2 text-xs font-medium transition-colors">
                      Start Quiz
                    </a>
                  )}
                  {task.id === 'share_x' && (
                    <button
                      onClick={shareState === 'idle' ? handleShare : undefined}
                      disabled={shareState === 'counting' || shareState === 'claiming' || shareState === 'done'}
                      className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl px-4 py-2 text-xs font-medium transition-colors disabled:opacity-70"
                    >
                      {shareState === 'idle' && 'Share'}
                      {shareState === 'counting' && `Verifying... ${shareCountdown}s`}
                      {shareState === 'claiming' && 'Claiming...'}
                      {shareState === 'done' && '✅ Done!'}
                    </button>
                  )}
                  {task.id === 'referral' && (
                    <button onClick={copyReferral} className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] rounded-xl px-4 py-2 text-xs font-medium transition-colors">
                      {copied ? '✅ Copied' : 'Copy Link'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#2a2a2a]">
              <h3 className="font-display font-black text-white">Top Players</h3>
              <p className="text-white/40 text-sm mt-1">Top 50 get guaranteed WL</p>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-white/30">No players yet — be the first!</div>
              ) : (
                leaderboard.map((entry, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-4 ${entry.x_username === user.x_username ? 'bg-[#00ff87]/5' : ''}`}>
                    <div className={`w-8 text-center font-display font-black text-lg
                      ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/30'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    {entry.x_avatar_url ? (
                      <Image src={entry.x_avatar_url} alt="avatar" width={36} height={36} className="rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white/30 text-sm">?</div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">
                        @{entry.x_username}
                        {entry.x_username === user.x_username && (
                          <span className="ml-2 text-xs text-[#00ff87]">(you)</span>
                        )}
                      </div>
                      <div className="text-white/30 text-xs font-mono mt-0.5">
                        {entry.wallet_address ? shortWallet(entry.wallet_address) : 'No wallet'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-[#00ff87]">{formatPoints(entry.bug_points)}</div>
                      <div className="text-white/30 text-xs">pts</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Your rank if not in top 10 */}
            {rank > 10 && (
              <div className="border-t border-[#2a2a2a] bg-[#00ff87]/5 px-5 py-4 flex items-center gap-4">
                <div className="w-8 text-center font-display font-black text-white/30">#{rank}</div>
                {user.x_avatar_url && (
                  <Image src={user.x_avatar_url} alt="avatar" width={36} height={36} className="rounded-full" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">@{user.x_username} <span className="text-[#00ff87] text-xs">(you)</span></div>
                </div>
                <div className="text-right">
                  <div className="font-display font-black text-[#00ff87]">{formatPoints(user.bug_points)}</div>
                  <div className="text-white/30 text-xs">pts</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#2a2a2a]">
              <h3 className="font-display font-black text-white">Recent Activity</h3>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-white/30">
                  No activity yet — complete a task to earn Bug Points!
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00ff87]/10 flex items-center justify-center text-lg">
                      {TASKS.find(t => t.id === activity.type)?.icon || '⚡'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{ACTIVITY_LABELS[activity.type] || activity.type}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-[#00ff87] font-semibold text-sm">+{activity.points_earned} pts</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
