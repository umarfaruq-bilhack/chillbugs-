'use client'

import { useState, useEffect } from 'react'

interface Submission {
  id: string
  tweet_url: string
  status: 'pending' | 'approved' | 'rejected'
  points_awarded: number
  admin_note: string | null
  created_at: string
}

function TweetEmbed({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=dark&dnt=true`)
      .then(r => r.json())
      .then(data => {
        setHtml(data.html)
        setLoading(false)
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
      })
      .catch(() => { setHtml(null); setLoading(false) })
  }, [url])

  if (loading) return (
    <div className="bg-[#0a0a0a] rounded-2xl p-6 flex items-center justify-center min-h-[120px]">
      <div className="w-5 h-5 border-2 border-[#00ff87]/30 border-t-[#00ff87] rounded-full animate-spin" />
    </div>
  )

  if (!html) return (
    <div className="bg-[#0a0a0a] rounded-2xl p-4 text-center">
      <p className="text-white/30 text-xs mb-2">Preview unavailable</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00ff87] text-xs hover:underline truncate block">{url}</a>
    </div>
  )

  return (
    <div className="rounded-2xl overflow-hidden" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default function ArtContestPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [tweetUrl, setTweetUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [closed, setClosed] = useState(false)

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    const res = await fetch('/api/art')
    if (res.status === 403) { setClosed(true); setLoading(false); return }
    const data = await res.json()
    setSubmissions(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tweetUrl.trim()) return
    setSubmitting(true)
    setMsg('')
    const res = await fetch('/api/art', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweet_url: tweetUrl }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('✅ Art submitted! Our team will review it soon.')
      setTweetUrl('')
      fetchSubmissions()
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setSubmitting(false)
  }

  const statusColor = (s: string) => s === 'approved' ? '#00ff87' : s === 'rejected' ? '#ef4444' : '#f97316'
  const statusLabel = (s: string) => s === 'approved' ? '✅ Approved' : s === 'rejected' ? '❌ Rejected' : '⏳ Pending'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <span>←</span><span className="text-sm">Back to dashboard</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="text-xl">🐛</span>
          <span className="font-display font-bold tracking-tight">CHILL BUGS</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎨</div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">ART CONTEST</h1>
          <p className="text-white/50 text-sm md:text-base max-w-lg mx-auto">
            Create Chill Bugs fan art, post on X tagging{' '}
            <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" className="text-[#00ff87]">@TheChillBugs</a>
            , then submit your tweet link below.
          </p>
        </div>

        {closed ? (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-10 text-center max-w-md mx-auto">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-display font-black text-2xl text-white mb-2">Contest Closed</h2>
            <p className="text-white/50">The art contest is currently closed. Check back soon!</p>
          </div>
        ) : (
          /* Side by side layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT — Submit form + how it works */}
            <div className="flex flex-col gap-4">
              {/* How it works */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
                <h3 className="font-display font-black text-white mb-4">How it works</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Create original Chill Bugs fan art (any style!)' },
                    { step: '2', text: 'Post it on X and tag @TheChillBugs' },
                    { step: '3', text: 'Copy your tweet URL and paste it below' },
                    { step: '4', text: 'Our team reviews and awards Bug Points!' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-xs font-bold text-[#00ff87] shrink-0 mt-0.5">{s.step}</div>
                      <p className="text-white/60 text-sm">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit form */}
              <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
                <h3 className="font-display font-black text-white mb-4">Submit Your Art</h3>
                <div className="mb-4">
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Tweet URL</label>
                  <input
                    type="url"
                    value={tweetUrl}
                    onChange={e => setTweetUrl(e.target.value)}
                    placeholder="https://x.com/yourhandle/status/..."
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff87]/50 text-sm"
                    required
                  />
                  <p className="text-white/30 text-xs mt-1.5">Must include @TheChillBugs tag to be valid</p>
                </div>
                {msg && <p className={`text-sm mb-4 ${msg.startsWith('✅') ? 'text-[#00ff87]' : 'text-red-400'}`}>{msg}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#00ff87] hover:bg-[#00cc6a] disabled:opacity-50 text-black font-display font-black py-3 rounded-xl transition-colors">
                  {submitting ? 'Submitting...' : '🎨 Submit Art'}
                </button>
              </form>

              {/* Stats */}
              {submissions.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Submitted', value: submissions.length },
                    { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length, green: true },
                    { label: 'Pts Earned', value: submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.points_awarded, 0), green: true },
                  ].map(s => (
                    <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3 text-center">
                      <div className={`font-display font-black text-xl ${s.green ? 'text-[#00ff87]' : 'text-white'}`}>{s.value}</div>
                      <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Submissions with tweet previews */}
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#00ff87]/30 border-t-[#00ff87] rounded-full animate-spin mx-auto" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-10 text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-white/40 text-sm">No submissions yet</p>
                  <p className="text-white/20 text-xs mt-1">Submit your first bug art!</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-black text-white">Your Submissions ({submissions.length})</h3>
                  {submissions.map((sub, i) => (
                    <div key={sub.id} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs">#{i + 1}</span>
                          <span className="text-white/50 text-xs">{new Date(sub.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.status === 'approved' && sub.points_awarded > 0 && (
                            <span className="text-[#00ff87] text-xs font-semibold">+{sub.points_awarded} pts ⚡</span>
                          )}
                          <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ color: statusColor(sub.status), background: `${statusColor(sub.status)}15`, border: `1px solid ${statusColor(sub.status)}30` }}>
                            {statusLabel(sub.status)}
                          </span>
                        </div>
                      </div>

                      {/* Tweet preview */}
                      <div className="p-4">
                        <TweetEmbed url={sub.tweet_url} />
                      </div>

                      {/* Admin note */}
                      {sub.admin_note && (
                        <div className="px-4 pb-4">
                          <p className="text-white/40 text-xs bg-white/5 rounded-xl px-3 py-2">
                            💬 {sub.admin_note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
