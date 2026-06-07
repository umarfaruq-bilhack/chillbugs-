'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  x_username: string
  x_avatar_url: string
  wallet_address: string | null
  bug_points: number
  streak_count: number
  referral_code: string
  created_at: string
}

interface Stats {
  totalUsers: number
  wlUsers: number
  walletConnected: number
}

interface Settings {
  game_enabled: boolean
  quiz_enabled: boolean
  checkin_enabled: boolean
  share_x_enabled: boolean
  referral_enabled: boolean
  art_contest_enabled: boolean
  collab_enabled: boolean
}

interface ArtSubmission {
  id: string
  tweet_url: string
  status: string
  points_awarded: number
  admin_note: string | null
  created_at: string
  users: { x_username: string; x_avatar_url: string; bug_points: number }
}

interface CollabApp {
  id: string
  project_name: string
  x_handle: string
  x_profile_url: string | null
  community_size: string
  description: string
  status: string
  spots_allocated: number
  admin_note: string | null
  winners_url: string | null
  created_at: string
  users: { x_username: string; x_avatar_url: string }
}

type Tab = 'users' | 'settings' | 'art' | 'collab'

export function AdminDashboardClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, wlUsers: 0, walletConnected: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    game_enabled: true, quiz_enabled: true, checkin_enabled: true,
    share_x_enabled: true, referral_enabled: true, art_contest_enabled: true, collab_enabled: false,
  })
  const [artSubmissions, setArtSubmissions] = useState<ArtSubmission[]>([])
  const [collabApps, setCollabApps] = useState<CollabApp[]>([])
  const [awardUser, setAwardUser] = useState<User | null>(null)
  const [awardPoints, setAwardPoints] = useState(50)
  const [awardReason, setAwardReason] = useState('Fan art bonus')
  const [awarding, setAwarding] = useState(false)
  const [awardMsg, setAwardMsg] = useState('')
  const [reviewArt, setReviewArt] = useState<ArtSubmission | null>(null)
  const [reviewCollab, setReviewCollab] = useState<CollabApp | null>(null)
  const [artPoints, setArtPoints] = useState(50)
  const [artStatus, setArtStatus] = useState('approved')
  const [artNote, setArtNote] = useState('')
  const [collabStatus, setCollabStatus] = useState('approved')
  const [collabSpots, setCollabSpots] = useState(10)
  const [collabNote, setCollabNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [tweetEmbed, setTweetEmbed] = useState<string | null>(null)
  const [embedLoading, setEmbedLoading] = useState(false)
  const [profileEmbed, setProfileEmbed] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${page}&search=${search}`)
    if (res.status === 401) { router.push('/admin'); return }
    const data = await res.json()
    setUsers(data.users)
    setTotal(data.total)
    setStats(data.stats)
    setLoading(false)
  }, [page, search, router])

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    setSettings(data)
  }, [])

  const fetchArt = useCallback(async () => {
    const res = await fetch('/api/admin/art')
    const data = await res.json()
    setArtSubmissions(Array.isArray(data) ? data : [])
  }, [])

  const fetchCollab = useCallback(async () => {
    const res = await fetch('/api/admin/collab')
    const data = await res.json()
    setCollabApps(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchSettings() }, [fetchSettings])
  useEffect(() => { fetchArt() }, [fetchArt])
  useEffect(() => { fetchCollab() }, [fetchCollab])

  const toggleSetting = async (key: string, value: boolean) => {
    setSettings(s => ({ ...s, [key]: value }))
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  }

  const handleAward = async () => {
    if (!awardUser) return
    setAwarding(true)
    const res = await fetch('/api/admin/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: awardUser.id, points: awardPoints, reason: awardReason }),
    })
    const data = await res.json()
    if (res.ok) {
      setAwardMsg(`✅ +${awardPoints} pts awarded to @${awardUser.x_username}!`)
      fetchUsers()
      setTimeout(() => { setAwardUser(null); setAwardMsg('') }, 2000)
    } else {
      setAwardMsg(`❌ ${data.error}`)
    }
    setAwarding(false)
  }

  const handleArtReview = async () => {
    if (!reviewArt) return
    setSaving(true)
    await fetch('/api/admin/art', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewArt.id, status: artStatus, points_awarded: artPoints, admin_note: artNote }),
    })
    setReviewArt(null)
    fetchArt()
    setSaving(false)
  }

  const fetchTweetEmbed = async (url: string) => {
    setTweetEmbed(null)
    setEmbedLoading(true)
    try {
      const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=dark&dnt=true&omit_script=false`)
      const data = await res.json()
      setTweetEmbed(data.html)
      // Load Twitter widget script to render the embed
      setTimeout(() => {
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load()
        } else {
          const script = document.createElement('script')
          script.src = 'https://platform.twitter.com/widgets.js'
          script.async = true
          document.body.appendChild(script)
        }
      }, 100)
    } catch {
      setTweetEmbed(null)
    }
    setEmbedLoading(false)
  }

  const fetchProfileEmbed = async (url: string) => {
    setProfileEmbed(null)
    setProfileLoading(true)
    try {
      const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=dark&dnt=true`)
      const data = await res.json()
      setProfileEmbed(data.html)
      setTimeout(() => {
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load()
        } else {
          const s = document.createElement('script')
          s.src = 'https://platform.twitter.com/widgets.js'
          s.async = true
          document.body.appendChild(s)
        }
      }, 100)
    } catch {
      setProfileEmbed(null)
    }
    setProfileLoading(false)
  }

  const handleCollabReview = async () => {    if (!reviewCollab) return
    setSaving(true)
    await fetch('/api/admin/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewCollab.id, status: collabStatus, spots_allocated: collabSpots, admin_note: collabNote }),
    })
    setReviewCollab(null)
    fetchCollab()
    setSaving(false)
  }

  const exportCSV = () => {
    const rows = [
      ['Rank', 'Username', 'Wallet', 'Bug Points', 'Streak', 'Joined'],
      ...users.map((u, i) => [i + 1 + (page - 1) * 20, '@' + u.x_username, u.wallet_address || 'No wallet', u.bug_points, u.streak_count, new Date(u.created_at).toLocaleDateString()])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chillbugs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const SETTINGS_LIST = [
    { key: 'game_enabled', label: 'Bug Catcher Game', icon: '🎮', desc: 'Allow users to play and earn points' },
    { key: 'quiz_enabled', label: 'Lore Quiz', icon: '❓', desc: 'Allow users to take quiz and earn points' },
    { key: 'checkin_enabled', label: 'Daily Check-in', icon: '📅', desc: 'Allow users to check in daily' },
    { key: 'share_x_enabled', label: 'Share on X', icon: '🐦', desc: 'Allow users to earn points by sharing' },
    { key: 'referral_enabled', label: 'Referral System', icon: '👥', desc: 'Allow users to earn referral points' },
    { key: 'art_contest_enabled', label: 'Art Contest', icon: '🎨', desc: 'Accept art submissions from users' },
    { key: 'collab_enabled', label: 'Collaborations', icon: '🤝', desc: 'Open collaboration applications' },
  ]

  const totalPages = Math.ceil(total / 20)
  const statusColor = (s: string) => s === 'approved' ? '#00ff87' : s === 'rejected' ? '#ef4444' : '#f97316'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐛</span>
          <span className="font-display font-black text-white">ADMIN</span>
          <span className="text-white/20 text-sm ml-2 hidden md:block">Chill Bugs Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="text-xs bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] px-3 py-1.5 rounded-xl hover:bg-[#00ff87]/20 transition-colors hidden md:block">📥 Export CSV</button>
          <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/60 border border-[#2a2a2a] px-3 py-1.5 rounded-xl transition-colors">Sign out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Players', value: stats.totalUsers, icon: '👥', color: 'text-white' },
            { label: 'WL Earned', value: stats.wlUsers, icon: '💎', color: 'text-[#00ff87]' },
            { label: 'Wallets', value: stats.walletConnected, icon: '🔗', color: 'text-blue-400' },
            { label: 'WL Left', value: Math.max(512 - stats.wlUsers, 0), icon: '🎯', color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`font-display font-black text-2xl ${s.color}`}>{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'users' as Tab, label: '👥 Users' },
            { id: 'settings' as Tab, label: '⚙️ Controls' },
            { id: 'art' as Tab, label: `🎨 Art (${artSubmissions.filter(a => a.status === 'pending').length})` },
            { id: 'collab' as Tab, label: `🤝 Collabs (${collabApps.filter(a => a.status === 'pending').length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id ? 'bg-[#00ff87] text-black' : 'bg-[#111111] border border-[#2a2a2a] text-white/50 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="flex gap-3 mb-4">
              <input type="text" placeholder="Search by username..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="flex-1 bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff87]/50 text-sm" />
              <button onClick={fetchUsers} className="bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] px-4 py-2.5 rounded-xl text-sm hover:bg-[#00ff87]/20 transition-colors">Search</button>
            </div>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-4">
              <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <h2 className="font-display font-black text-white">Users ({total})</h2>
                <span className="text-white/40 text-xs">Page {page} of {totalPages}</span>
              </div>
              {loading ? (
                <div className="p-8 text-center text-white/30">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a2a]">
                        {['Rank', 'User', 'Wallet', 'Points', 'Streak', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2a]">
                      {users.map((user, i) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-white/40 font-mono">#{(page - 1) * 20 + i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {user.x_avatar_url ? <Image src={user.x_avatar_url} alt="avatar" width={28} height={28} className="rounded-full" /> : <div className="w-7 h-7 rounded-full bg-[#2a2a2a]" />}
                              <span className="text-white font-medium">@{user.x_username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-white/50">
                            {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : <span className="text-red-400/50">No wallet</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-display font-black ${user.bug_points >= 2000 ? 'text-[#00ff87]' : 'text-white'}`}>{user.bug_points.toLocaleString()}</span>
                            {user.bug_points >= 2000 && <span className="ml-1 text-xs text-[#00ff87]">✅</span>}
                          </td>
                          <td className="px-4 py-3 text-orange-400">{user.streak_count}d 🔥</td>
                          <td className="px-4 py-3 text-white/40 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => { setAwardUser(user); setAwardMsg('') }}
                              className="text-xs bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/20 text-[#00ff87] px-3 py-1.5 rounded-lg transition-colors">+Award pts</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-[#111111] border border-[#2a2a2a] rounded-xl text-white/50 hover:text-white disabled:opacity-30 text-sm transition-colors">← Prev</button>
              <span className="text-white/40 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-4 py-2 bg-[#111111] border border-[#2a2a2a] rounded-xl text-white/50 hover:text-white disabled:opacity-30 text-sm transition-colors">Next →</button>
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h2 className="font-display font-black text-white">Platform Controls</h2>
              <p className="text-white/40 text-xs mt-1">Toggle features on/off in real time</p>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {SETTINGS_LIST.map(s => (
                <div key={s.key} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{s.label}</p>
                      <p className="text-white/40 text-xs">{s.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting(s.key, !settings[s.key as keyof Settings])}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings[s.key as keyof Settings] ? 'bg-[#00ff87]' : 'bg-[#2a2a2a]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[s.key as keyof Settings] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Art Tab */}
        {activeTab === 'art' && (() => {
          // Group submissions by user
          const grouped = artSubmissions.reduce((acc, sub) => {
            const key = sub.users?.x_username || 'unknown'
            if (!acc[key]) acc[key] = { user: sub.users, submissions: [] }
            acc[key].submissions.push(sub)
            return acc
          }, {} as Record<string, { user: ArtSubmission['users']; submissions: ArtSubmission[] }>)

          const totalPending = artSubmissions.filter(a => a.status === 'pending').length
          const totalApproved = artSubmissions.filter(a => a.status === 'approved').length
          const totalPoints = artSubmissions.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.points_awarded, 0)

          return (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Submissions', value: artSubmissions.length, color: 'text-white' },
                  { label: 'Pending Review', value: totalPending, color: 'text-orange-400' },
                  { label: 'Total Pts Awarded', value: totalPoints, color: 'text-[#00ff87]' },
                ].map(s => (
                  <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 text-center">
                    <div className={`font-display font-black text-2xl ${s.color}`}>{s.value}</div>
                    <div className="text-white/40 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {artSubmissions.length === 0 ? (
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 text-center text-white/30">No art submissions yet</div>
              ) : (
                Object.entries(grouped).map(([username, { user, submissions }]) => {
                  const userPending = submissions.filter(s => s.status === 'pending').length
                  const userApproved = submissions.filter(s => s.status === 'approved').length
                  const userPoints = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.points_awarded, 0)

                  return (
                    <div key={username} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                      {/* User header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] bg-white/5">
                        <div className="flex items-center gap-3">
                          {user?.x_avatar_url ? <Image src={user.x_avatar_url} alt="avatar" width={36} height={36} className="rounded-full" /> : <div className="w-9 h-9 rounded-full bg-[#2a2a2a]" />}
                          <div>
                            <p className="text-white font-bold">@{username}</p>
                            <p className="text-white/40 text-xs">{user?.bug_points?.toLocaleString()} Bug Points total</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/40">{submissions.length} art{submissions.length !== 1 ? 's' : ''}</span>
                          {userPending > 0 && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full">{userPending} pending</span>}
                          {userApproved > 0 && <span className="bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 px-2 py-1 rounded-full">+{userPoints} pts earned</span>}
                        </div>
                      </div>

                      {/* Submissions list */}
                      <div className="divide-y divide-[#2a2a2a]">
                        {submissions.map((sub, idx) => (
                          <div key={sub.id} className="flex items-center gap-4 px-5 py-3">
                            <span className="text-white/20 text-xs w-4 shrink-0">#{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <a href={sub.tweet_url} target="_blank" rel="noopener noreferrer"
                                className="text-[#00ff87] text-xs hover:underline truncate block">{sub.tweet_url}</a>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-white/20 text-xs">{new Date(sub.created_at).toLocaleDateString()}</span>
                                {sub.admin_note && <span className="text-white/30 text-xs italic">"{sub.admin_note}"</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{ color: statusColor(sub.status), background: `${statusColor(sub.status)}15`, border: `1px solid ${statusColor(sub.status)}30` }}>
                                {sub.status}
                              </span>
                              {sub.status === 'approved' && (
                                <span className="text-[#00ff87] text-xs font-semibold">+{sub.points_awarded} pts</span>
                              )}
                              <button onClick={() => { setReviewArt(sub); setArtStatus(sub.status); setArtPoints(sub.points_awarded || 50); setArtNote(sub.admin_note || ''); fetchTweetEmbed(sub.tweet_url) }}
                                className="text-xs bg-white/5 hover:bg-white/10 border border-[#2a2a2a] text-white/60 px-3 py-1.5 rounded-lg transition-colors">
                                Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )
        })()}

        {/* Collab Tab */}
        {activeTab === 'collab' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Applications', value: collabApps.length, color: 'text-white' },
                { label: 'Approved', value: collabApps.filter(a => a.status === 'approved').length, color: 'text-[#00ff87]' },
                { label: 'Winners Submitted', value: collabApps.filter(a => a.winners_url).length, color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 text-center">
                  <div className={`font-display font-black text-2xl ${s.color}`}>{s.value}</div>
                  <div className="text-white/40 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {collabApps.length === 0 ? (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 text-center text-white/30">No collab applications yet</div>
            ) : (
              collabApps.map(app => (
                <div key={app.id} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                  {/* App header */}
                  <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      {app.users?.x_avatar_url ? <Image src={app.users.x_avatar_url} alt="avatar" width={36} height={36} className="rounded-full shrink-0" /> : <div className="w-9 h-9 rounded-full bg-[#2a2a2a] shrink-0" />}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold">{app.project_name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ color: statusColor(app.status), background: `${statusColor(app.status)}15`, border: `1px solid ${statusColor(app.status)}30` }}>
                            {app.status}
                          </span>
                          {app.status === 'approved' && <span className="text-[#00ff87] text-xs font-semibold">{app.spots_allocated} spots</span>}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{app.x_handle} · {app.community_size} · @{app.users?.x_username}</p>
                      </div>
                    </div>
                    <button onClick={() => { setReviewCollab(app); setCollabStatus(app.status); setCollabSpots(app.spots_allocated || 10); setCollabNote(app.admin_note || ''); if (app.x_profile_url) fetchProfileEmbed(app.x_profile_url) }}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-[#2a2a2a] text-white/60 px-3 py-1.5 rounded-lg transition-colors shrink-0">Review</button>
                  </div>

                  {/* Winners section */}
                  <div className="px-5 py-4">
                    {app.winners_url ? (
                      <div className="flex items-center justify-between bg-[#00ff87]/5 border border-[#00ff87]/20 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <p className="text-[#00ff87] text-sm font-semibold">Winners List Submitted</p>
                            <p className="text-white/40 text-xs">Ready for WL snapshot processing</p>
                          </div>
                        </div>
                        <a href={app.winners_url} target="_blank" rel="noopener noreferrer"
                          className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                          📥 Download
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-white/5 border border-[#2a2a2a] rounded-xl px-4 py-3">
                        <span className="text-xl opacity-40">🏆</span>
                        <p className="text-white/30 text-xs">
                          {app.status === 'approved' ? 'Waiting for winners list from collaborator...' : 'Approve collab to enable winners submission'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Award Modal */}
      {awardUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setAwardUser(null)}>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-black text-white text-xl mb-1">Award Points</h2>
            <p className="text-white/40 text-sm mb-5">to @{awardUser.x_username}</p>
            <div className="mb-4">
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Points</label>
              <input type="number" value={awardPoints} onChange={e => setAwardPoints(parseInt(e.target.value))} min={1}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff87]/50" />
            </div>
            <div className="mb-5">
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Reason</label>
              <select value={awardReason} onChange={e => setAwardReason(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none">
                <option>Fan art bonus</option>
                <option>Community support</option>
                <option>Collaboration bonus</option>
                <option>Contest winner</option>
                <option>Manual WL award</option>
                <option>Bug report reward</option>
              </select>
            </div>
            {awardMsg && <p className={`text-sm mb-4 ${awardMsg.startsWith('✅') ? 'text-[#00ff87]' : 'text-red-400'}`}>{awardMsg}</p>}
            <div className="flex gap-3">
              <button onClick={() => setAwardUser(null)} className="flex-1 border border-[#2a2a2a] text-white/50 py-3 rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAward} disabled={awarding}
                className="flex-1 bg-[#00ff87] hover:bg-[#00cc6a] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                {awarding ? 'Awarding...' : `+${awardPoints} Points`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Art Review Modal */}
      {reviewArt && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { setReviewArt(null); setTweetEmbed(null) }}>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
              <div>
                <h2 className="font-display font-black text-white text-xl">Review Art</h2>
                <p className="text-white/40 text-sm">@{reviewArt.users?.x_username}</p>
              </div>
              <button onClick={() => { setReviewArt(null); setTweetEmbed(null) }} className="text-white/30 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* Tweet Preview */}
            <div className="p-5 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-xs uppercase tracking-wider">Tweet Preview</p>
                <a href={reviewArt.tweet_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#00ff87] text-xs hover:underline flex items-center gap-1">
                  Open in X ↗
                </a>
              </div>
              {embedLoading ? (
                <div className="bg-[#0a0a0a] rounded-2xl p-6 text-center">
                  <div className="w-6 h-6 border-2 border-[#00ff87]/30 border-t-[#00ff87] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/30 text-xs">Loading tweet preview...</p>
                </div>
              ) : tweetEmbed ? (
                <div
                  className="tweet-embed rounded-2xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: tweetEmbed }}
                />
              ) : (
                <div className="bg-[#0a0a0a] rounded-2xl p-4 text-center">
                  <p className="text-white/30 text-xs mb-2">Preview unavailable</p>
                  <a href={reviewArt.tweet_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#00ff87] text-xs hover:underline">
                    🔗 {reviewArt.tweet_url}
                  </a>
                </div>
              )}
            </div>

            {/* Review form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Status</label>
                <select value={artStatus} onChange={e => setArtStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {artStatus === 'approved' && (
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Points to Award</label>
                  <input type="number" value={artPoints} onChange={e => setArtPoints(parseInt(e.target.value))} min={0}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none" />
                </div>
              )}
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Note to user (optional)</label>
                <input type="text" value={artNote} onChange={e => setArtNote(e.target.value)} placeholder="e.g. Amazing artwork!"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setReviewArt(null); setTweetEmbed(null) }} className="flex-1 border border-[#2a2a2a] text-white/50 py-3 rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={handleArtReview} disabled={saving}
                  className="flex-1 bg-[#00ff87] hover:bg-[#00cc6a] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collab Review Modal */}
      {reviewCollab && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { setReviewCollab(null); setProfileEmbed(null) }}>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
              <div>
                <h2 className="font-display font-black text-white text-xl">{reviewCollab.project_name}</h2>
                <p className="text-white/40 text-sm">{reviewCollab.x_handle} · {reviewCollab.community_size}</p>
              </div>
              <button onClick={() => { setReviewCollab(null); setProfileEmbed(null) }} className="text-white/30 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* X Profile link */}
            {reviewCollab.x_profile_url && (
              <div className="px-5 py-4 border-b border-[#2a2a2a]">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">X Profile</p>
                <a href={reviewCollab.x_profile_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 hover:border-[#00ff87]/30 transition-colors group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/40 shrink-0">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[#00ff87] text-sm group-hover:underline truncate">{reviewCollab.x_profile_url}</span>
                  <span className="text-white/20 text-xs ml-auto shrink-0">↗</span>
                </a>
              </div>
            )}

            {/* Description */}
            <div className="px-5 py-4 border-b border-[#2a2a2a]">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">About</p>
              <p className="text-white/70 text-sm leading-relaxed">{reviewCollab.description}</p>
              <p className="text-white/30 text-xs mt-2">Applied by @{reviewCollab.users?.x_username} · {new Date(reviewCollab.created_at).toLocaleDateString()}</p>
              {reviewCollab.winners_url && (
                <a href={reviewCollab.winners_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] px-3 py-2 rounded-xl text-xs hover:bg-[#00ff87]/20 transition-colors">
                  🏆 Download Winners List ↗
                </a>
              )}
            </div>

            {/* Review form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Status</label>
                <select value={collabStatus} onChange={e => setCollabStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {(collabStatus === 'approved' || reviewCollab.status === 'approved') && (
                <>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">WL Spots to Allocate</label>
                    <input type="number" value={collabSpots} onChange={e => setCollabSpots(parseInt(e.target.value))} min={1}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none" />
                  </div>

                  {/* Document upload */}
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
                      Collab Document (PDF/DOC) — user will download this
                    </label>
                    {reviewCollab.document_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-xl px-4 py-3">
                          <span className="text-[#00ff87] text-sm">📄 Document uploaded</span>
                          <a href={reviewCollab.document_url} target="_blank" rel="noopener noreferrer"
                            className="text-[#00ff87] text-xs hover:underline ml-auto">View ↗</a>
                        </div>
                        <p className="text-white/30 text-xs">Upload a new file to replace it:</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const fd = new FormData()
                            fd.append('file', file)
                            fd.append('collab_id', reviewCollab.id)
                            const res = await fetch('/api/admin/collab-doc', { method: 'POST', body: fd })
                            const data = await res.json()
                            if (res.ok) { setReviewCollab({ ...reviewCollab, document_url: data.url }); fetchCollab() }
                          }}
                          className="text-xs text-white/40 file:bg-[#00ff87]/10 file:border file:border-[#00ff87]/20 file:text-[#00ff87] file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="bg-[#0a0a0a] border-2 border-dashed border-[#2a2a2a] rounded-xl px-4 py-6 text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-white/40 text-sm mb-3">Upload collab template for user to download</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const fd = new FormData()
                            fd.append('file', file)
                            fd.append('collab_id', reviewCollab.id)
                            const res = await fetch('/api/admin/collab-doc', { method: 'POST', body: fd })
                            const data = await res.json()
                            if (res.ok) { setReviewCollab({ ...reviewCollab, document_url: data.url }); fetchCollab() }
                          }}
                          className="text-xs text-white/40 file:bg-[#00ff87]/10 file:border file:border-[#00ff87]/20 file:text-[#00ff87] file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Note to applicant (optional)</label>
                <input type="text" value={collabNote} onChange={e => setCollabNote(e.target.value)} placeholder="e.g. Welcome to the family!"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setReviewCollab(null); setProfileEmbed(null) }} className="flex-1 border border-[#2a2a2a] text-white/50 py-3 rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCollabReview} disabled={saving}
                  className="flex-1 bg-[#00ff87] hover:bg-[#00cc6a] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
