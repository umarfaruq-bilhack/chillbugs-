'use client'

import { useState, useEffect } from 'react'

interface CollabApp {
  id: string
  project_name: string
  x_handle: string
  x_profile_url: string | null
  community_size: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  spots_allocated: number
  admin_note: string | null
  document_url: string | null
  winners_url: string | null
  created_at: string
}

const COLLAB_TEMPLATE = (projectName: string, spots: number) => `
🤝 COLLABORATION ANNOUNCEMENT

We're excited to partner with ${projectName} for the Chill Bugs Season 1 mint!

As part of this collaboration, ${projectName} community members will receive:
• ${spots} guaranteed whitelist spots
• Priority access to the Chill Bugs mint
• Exclusive community recognition

To claim your WL spot:
1. Follow @TheChillBugs on X
2. Join the Chill Bugs community
3. Connect your wallet at chillbugs.xyz
4. Earn Bug Points through games & quests

Spots are limited — first come, first served!

🐛 chillbugs.xyz
`.trim()

export default function CollabPage() {
  const [application, setApplication] = useState<CollabApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [closed, setClosed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadingWinners, setUploadingWinners] = useState(false)
  const [winnersMsg, setWinnersMsg] = useState('')
  const [winnersSubmitted, setWinnersSubmitted] = useState(false)
  const [form, setForm] = useState({
    project_name: '',
    x_handle: '',
    x_profile_url: '',
    community_size: '',
    description: '',
  })

  useEffect(() => { fetchApplication() }, [])

  const fetchApplication = async () => {
    setLoading(true)
    const res = await fetch('/api/collab')
    if (res.status === 403) { setClosed(true); setLoading(false); return }
    const data = await res.json()
    setApplication(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg('')
    const res = await fetch('/api/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      fetchApplication()
    } else {
      setMsg(data.error)
      if (data.error === 'Collaborations are currently closed') setClosed(true)
    }
    setSubmitting(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWinnersUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingWinners(true)
    setWinnersMsg('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/winners', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setWinnersSubmitted(true)
      fetchApplication()
    } else {
      setWinnersMsg(`❌ ${data.error}`)
    }
    setUploadingWinners(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00ff87]/30 border-t-[#00ff87] rounded-full animate-spin" />
    </div>
  )

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

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="font-display font-black text-4xl text-white mb-3">COLLABORATIONS</h1>
          <p className="text-white/50 text-base leading-relaxed">
            Partner with Chill Bugs for exclusive whitelist allocations for your community.
          </p>
        </div>

        {/* Closed */}
        {closed && !application && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-display font-black text-2xl text-white mb-2">Applications Closed</h2>
            <p className="text-white/50">Follow <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" className="text-[#00ff87]">@TheChillBugs</a> for updates.</p>
          </div>
        )}

        {/* Approved */}
        {application?.status === 'approved' && (
          <div className="space-y-5">
            <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-3xl p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-display font-black text-2xl text-[#00ff87] mb-1">Collaboration Approved!</h2>
              <p className="text-white/60 text-sm">Welcome to the Chill Bugs family, {application.project_name}!</p>
            </div>

            {/* Spots card */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">WL Spots Allocated</p>
                  <p className="font-display font-black text-4xl text-[#00ff87]">{application.spots_allocated}</p>
                  <p className="text-white/40 text-xs mt-1">spots reserved for your community</p>
                </div>
                <div className="text-5xl">💎</div>
              </div>
              {application.admin_note && (
                <p className="text-white/50 text-sm bg-white/5 rounded-xl p-3 mt-4">💬 {application.admin_note}</p>
              )}
            </div>

            {/* Document download */}
            {application.document_url && (
              <div className="bg-[#111111] border border-[#00ff87]/20 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-black text-white mb-1">📄 Collaboration Document</p>
                    <p className="text-white/40 text-xs">Your official collab agreement & details</p>
                  </div>
                  <a href={application.document_url} target="_blank" rel="noopener noreferrer" download
                    className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                    📥 Download
                  </a>
                </div>
              </div>
            )}

            {/* Winners list upload */}
            {(winnersSubmitted || application.winners_url) ? (
              <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-3xl p-10 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="font-display font-black text-2xl text-[#00ff87] mb-2">Thank You!</h2>
                <p className="text-white/60 text-base mb-1">Your winners list has been submitted successfully.</p>
                <p className="text-white/40 text-sm">Our team will review and process the WL spots shortly.</p>
                <div className="mt-6 bg-white/5 rounded-2xl p-4 text-sm text-white/40">
                  <p>📬 You'll hear from us via X if anything needs clarification.</p>
                  <p className="mt-1">Stay Chill. 🐛</p>
                </div>
                {/* Allow replacing if needed */}
                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 text-white/20 hover:text-white/40 text-xs cursor-pointer transition-colors">
                    <span>📎 Replace winners list</span>
                    <input type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" onChange={handleWinnersUpload} className="hidden" disabled={uploadingWinners} />
                  </label>
                </div>
                <a href="/dashboard" className="mt-6 inline-block bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black px-8 py-3 rounded-xl transition-colors">
                  Back to Dashboard
                </a>
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-black text-white mb-1">🏆 Submit Winners List</h3>
                    <p className="text-white/40 text-xs">Upload your community winners for the {application.spots_allocated} allocated WL spots</p>
                  </div>
                  {application.winners_url && (
                    <span className="text-xs bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] px-2 py-1 rounded-full shrink-0">Submitted ✅</span>
                  )}
                </div>

                {/* Requirements */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4 text-xs text-white/50 space-y-1.5">
                  <p className="text-white/70 font-semibold mb-2">Each winner entry must include:</p>
                  <p>• Discord Username</p>
                  <p>• Discord ID</p>
                  <p>• X Username</p>
                  <p>• Wallet Address</p>
                  <p className="text-white/30 mt-2 pt-2 border-t border-white/10">Submit as CSV, Excel, PDF or Word document</p>
                </div>

                {/* Requirements reminder */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4 text-xs text-orange-300">
                  ⚠️ All collab requirements must be completed before submitting. Winners who haven't followed @TheChillBugs & @y0itsnash, liked & reposted the pinned tweet may be disqualified.
                </div>

                {application.winners_url ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-xl px-4 py-3">
                      <span className="text-[#00ff87] text-sm">📋 Winners list submitted</span>
                      <a href={application.winners_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#00ff87] text-xs hover:underline ml-auto">View ↗</a>
                    </div>
                    <p className="text-white/30 text-xs">Need to update? Upload a new file to replace:</p>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 cursor-pointer hover:border-[#00ff87]/30 transition-colors">
                      <span className="text-white/40 text-xs">{uploadingWinners ? 'Uploading...' : '📎 Replace file (CSV/Excel/PDF/Doc)'}</span>
                      <input type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" onChange={handleWinnersUpload} className="hidden" disabled={uploadingWinners} />
                    </label>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer transition-colors
                    ${uploadingWinners ? 'border-[#2a2a2a] opacity-50' : 'border-[#2a2a2a] hover:border-[#00ff87]/30'}`}>
                    <span className="text-3xl">📋</span>
                    <span className="text-white/60 text-sm font-medium">{uploadingWinners ? 'Uploading...' : 'Click to upload winners list'}</span>
                    <span className="text-white/30 text-xs">CSV, Excel, PDF or Word · Max {application.spots_allocated} winners</span>
                    <input type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" onChange={handleWinnersUpload} className="hidden" disabled={uploadingWinners} />
                  </label>
                )}

                {winnersMsg && (
                  <p className={`text-sm mt-3 ${winnersMsg.startsWith('✅') ? 'text-[#00ff87]' : 'text-red-400'}`}>{winnersMsg}</p>
                )}
              </div>
            )}

            {/* Announcement template — only show if no document uploaded */}
            {!application.document_url && (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-black text-white">Announcement Template</h3>
                  <button
                    onClick={() => handleCopy(COLLAB_TEMPLATE(application.project_name, application.spots_allocated))}
                    className="text-xs bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] px-3 py-1.5 rounded-lg hover:bg-[#00ff87]/20 transition-colors"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap bg-[#0a0a0a] rounded-xl p-4 font-mono">
                  {COLLAB_TEMPLATE(application.project_name, application.spots_allocated)}
                </pre>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(COLLAB_TEMPLATE(application.project_name, application.spots_allocated))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
              </div>
            )}
          </div>
        )}

        {/* Pending */}
        {application?.status === 'pending' && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="font-display font-black text-2xl text-white mb-2">Application Pending</h2>
            <p className="text-white/50 mb-5">We're reviewing <span className="text-white font-semibold">{application.project_name}</span>. We'll get back to you soon!</p>
            <div className="bg-white/5 rounded-2xl p-4 text-left text-sm space-y-2">
              <p className="text-white/40"><span className="text-white/60">Project:</span> {application.project_name}</p>
              <p className="text-white/40"><span className="text-white/60">X Handle:</span> {application.x_handle}</p>
              {application.x_profile_url && (
                <p className="text-white/40"><span className="text-white/60">Profile:</span>{' '}
                  <a href={application.x_profile_url} target="_blank" rel="noopener noreferrer" className="text-[#00ff87] hover:underline">{application.x_profile_url}</a>
                </p>
              )}
              <p className="text-white/40"><span className="text-white/60">Community Size:</span> {application.community_size}</p>
              <p className="text-white/40"><span className="text-white/60">Applied:</span> {new Date(application.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Rejected */}
        {application?.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="font-display font-black text-2xl text-white mb-2">Application Not Approved</h2>
            <p className="text-white/50 mb-3">Unfortunately we couldn't approve your collaboration at this time.</p>
            {application.admin_note && <p className="text-white/40 text-sm bg-white/5 rounded-xl p-3">💬 {application.admin_note}</p>}
          </div>
        )}

        {/* Application form */}
        {!application && !closed && (
          <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-black text-white text-xl mb-2">Apply for Collaboration</h3>

            {[
              { key: 'project_name', label: 'Project / Collection Name', placeholder: 'e.g. Cool Cats NFT' },
              { key: 'x_handle', label: 'X (Twitter) Handle', placeholder: '@yourproject' },
              { key: 'x_profile_url', label: 'X Profile Link', placeholder: 'https://twitter.com/yourproject' },
              { key: 'community_size', label: 'Community Size', placeholder: 'e.g. 5,000 followers / 2,000 holders' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">{field.label}</label>
                <input
                  type="text"
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff87]/50 text-sm"
                  required
                />
              </div>
            ))}

            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Why collaborate with Chill Bugs?</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Tell us about your project and why you'd like to collaborate..."
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff87]/50 text-sm resize-none"
                required
              />
            </div>

            {msg && <p className="text-red-400 text-sm">{msg}</p>}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#00ff87] hover:bg-[#00cc6a] disabled:opacity-50 text-black font-display font-black py-3 rounded-xl transition-colors">
              {submitting ? 'Submitting...' : '🤝 Submit Application'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
