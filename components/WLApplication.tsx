'use client'

import { useState, useEffect } from 'react'

// Intro animation component
function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 3500)
    const t4 = setTimeout(() => onDone(), 4200)

    // Smooth progress bar over 3.5 seconds
    let start = 0
    const interval = setInterval(() => {
      start += 1
      setProgress(Math.min(start, 100))
      if (start >= 100) clearInterval(interval)
    }, 35)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
      clearInterval(interval)
    }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.6s ease',
      opacity: phase === 3 ? 0 : 1,
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,135,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Bug image with bounce */}
      <div style={{
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(60px)',
        opacity: phase >= 1 ? 1 : 0,
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: '-20px',
          background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: phase >= 1 ? 'pulse 2s ease-in-out infinite' : 'none',
        }} />
        <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width: '120px', height: '120px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
      </div>

      {/* Title */}
      <div style={{
        transition: 'all 0.5s ease 0.3s',
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ color: 'white', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', fontFamily: 'var(--font-display, sans-serif)' }}>
          CHILL BUGS
        </div>
        <div style={{ color: '#00ff87', fontSize: '14px', marginTop: '8px', letterSpacing: '3px' }}>
          ENTER THE PLAYGROUND
        </div>
      </div>

      {/* Loading bar with percentage */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'var(--font-display, sans-serif)' }}>
          {progress}%
        </div>
        <div style={{ height: '3px', background: '#1a1a1a' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #00ff87, #00cc6a)', width: `${progress}%`, transition: 'width 0.1s linear', boxShadow: '0 0 10px rgba(0,255,135,0.5)' }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export function WLApplication({ tweetUrl = 'https://twitter.com/TheChillBugs' }: { tweetUrl?: string }) {
  const [showIntro, setShowIntro] = useState(true)
  const [step, setStep] = useState(1)
  const [doneFollow, setDoneFollow] = useState(false)
  const [doneRepost, setDoneRepost] = useState(false)
  const [doneQuote, setDoneQuote] = useState(false)
  const [doneTag, setDoneTag] = useState(false)
  const [clickedFollow, setClickedFollow] = useState(false)
  const [clickedRepost, setClickedRepost] = useState(false)
  const [clickedQuote, setClickedQuote] = useState(false)
  const [clickedTag, setClickedTag] = useState(false)
  const [commentLink, setCommentLink] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commentVerified, setCommentVerified] = useState(false)
  const [form, setForm] = useState({ x_username: '', discord_username: '', referral_code: '' })
  const [wallet, setWallet] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [imgHovered, setImgHovered] = useState(false)

  const verifyComment = () => {
    const url = commentLink.trim()
    if (!url) { setCommentError('Please paste your comment link'); return }
    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      setCommentError('Please paste a valid X/Twitter link'); return
    }
    setCommentError('')
    setCommentVerified(true)
  }

  const allTasksDone = doneFollow && doneRepost && doneQuote && doneTag && commentVerified

  const quoteText = `Joining @TheChillBugs Buglist! 🐛\n\nTag your friends below 👇\nJoin here: ${typeof window !== 'undefined' ? window.location.origin : 'https://chillbugs.xyz'}?wlref=${form.x_username.replace('@','')}`

  const handleSubmit = async () => {
    if (!wallet.trim()) { setError('Wallet address is required'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/wl-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x_username: form.x_username,
        discord_username: form.discord_username,
        wallet_address: wallet,
        referral_code: form.referral_code,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      const refLink = `${window.location.origin}?wlref=${form.x_username.replace('@', '')}`
      setReferralLink(refLink)
      setSubmitted(true)
    } else {
      setError(data.error || 'Failed to submit')
    }
    setSubmitting(false)
  }

  const shareOnX = () => {
    const text = `Just joined the @TheChillBugs Buglist! 🐛\n\nSecure your WL spot before it's gone.\nJoin here: ${referralLink}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const navStyle: React.CSSProperties = { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'var(--font-display, sans-serif)', display: 'flex', flexDirection: 'column' }
  const cardStyle: React.CSSProperties = { background: '#111', border: '1px solid #2a2a2a', borderRadius: '24px', padding: '28px 32px', width: '100%', maxWidth: '460px', margin: '0 auto' }
  const inputStyle: React.CSSProperties = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, marginTop: '6px' }
  const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', display: 'block', marginTop: '14px' }
  const btnStyle: React.CSSProperties = { width: '100%', background: '#00ff87', color: '#000', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '16px', fontWeight: 900, cursor: 'pointer', marginTop: '20px' }
  const btnDisabled: React.CSSProperties = { ...btnStyle, background: '#2a2a2a', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }

  const taskRow = (done: boolean, opacity: number = 1) => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: '12px', padding: '14px',
    borderRadius: '14px', border: `1px solid ${done ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`,
    background: done ? 'rgba(0,255,135,0.03)' : '#0a0a0a', marginBottom: '10px', opacity,
  })

  const taskIcon = (done: boolean) => ({
    width: '40px', height: '40px', borderRadius: '10px',
    background: done ? 'rgba(0,255,135,0.1)' : '#2a2a2a',
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
    fontSize: '18px', flexShrink: 0 as const,
  })

  const goBtn = { padding: '8px 16px', borderRadius: '10px', background: '#00ff87', color: '#000', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
  const markBtn = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a', color: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '10px' }

  // Success screen
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--font-display, sans-serif)' }}>
        <div style={{ width: '100%', maxWidth: '460px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '24px', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width: '100px', height: '100px', objectFit: 'contain', animation: 'bounce 1s ease infinite' }} />
          </div>
          <h1 style={{ color: '#00ff87', fontSize: '28px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-1px' }}>YOU'VE JOINED THE BUGLIST!</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 24px' }}>Your application is confirmed. Share your link to refer friends!</p>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 8px', letterSpacing: '2px' }}>YOUR REFERRAL LINK</p>
            <p style={{ color: '#00ff87', fontSize: '13px', fontFamily: 'monospace', margin: '0 0 12px', wordBreak: 'break-all' }}>{referralLink}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={copyLink} style={{ flex: 1, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', color: '#00ff87', borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button onClick={shareOnX} style={{ flex: 1, background: 'white', border: 'none', color: 'black', borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Share on X
              </button>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Follow <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" style={{ color: '#00ff87' }}>@TheChillBugs</a> for updates. Stay Chill. 🐛</p>
        </div>
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
      </div>
    )
  }

  return (
    <>
      {showIntro && <IntroAnimation onDone={() => setShowIntro(false)} />}
      <div style={{ ...navStyle, opacity: showIntro ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Grid bg */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 900, fontSize: '16px', letterSpacing: '-0.5px' }}>CHILL BUGS</span>
          </div>
          <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>@TheChillBugs</a>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '0 16px 20px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-1px' }}>JOIN THE BUGLIST</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Complete 3 simple steps to secure your spot</p>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, background: s < step ? '#00ff87' : s === step ? '#00ff87' : '#2a2a2a', color: s <= step ? '#000' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ width: '60px', height: '2px', background: s < step ? '#00ff87' : '#2a2a2a', transition: 'background 0.3s ease' }} />}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 16px 40px', position: 'relative', zIndex: 1 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={cardStyle}>
              {/* Animated bug image */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div
                  onMouseEnter={() => setImgHovered(true)}
                  onMouseLeave={() => setImgHovered(false)}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  {/* Rotating ring */}
                  <div style={{
                    position: 'absolute', inset: '-12px', borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: '#00ff87',
                    borderRightColor: 'rgba(0,255,135,0.3)',
                    animation: 'spin 3s linear infinite',
                  }} />
                  {/* Glow */}
                  <div style={{
                    position: 'absolute', inset: '-8px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, transparent 70%)',
                    animation: 'pulse2 2s ease-in-out infinite',
                  }} />
                  <img
                    src="/chillbug-clean.png"
                    alt="Chill Bug"
                    style={{
                      width: '110px', height: '110px', objectFit: 'contain', position: 'relative', zIndex: 1,
                      transition: 'transform 0.3s ease',
                      transform: imgHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>

              <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>Your Details</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 4px' }}>Enter your socials so we can verify your tasks.</p>

              <label style={labelStyle}>X (TWITTER) USERNAME *</label>
              <input style={inputStyle} placeholder="@your_handle" value={form.x_username} onChange={e => setForm(f => ({ ...f, x_username: e.target.value }))} />
              <label style={labelStyle}>DISCORD USERNAME</label>
              <input style={inputStyle} placeholder="username#0000" value={form.discord_username} onChange={e => setForm(f => ({ ...f, discord_username: e.target.value }))} />
              <label style={labelStyle}>REFERRAL CODE (OPTIONAL)</label>
              <input style={inputStyle} placeholder="friend's code" value={form.referral_code} onChange={e => setForm(f => ({ ...f, referral_code: e.target.value }))} />

              {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
              <button style={btnStyle} onClick={() => {
                if (!form.x_username) { setError('X username is required'); return }
                setError(''); setStep(2)
              }}>Continue →</button>

              <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes pulse2 { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
                @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
              `}</style>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={cardStyle}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Back</button>
              <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>Social Tasks</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 20px' }}>Complete all tasks in order to continue.</p>

              {/* Task 1 - Follow */}
              <div style={taskRow(doneFollow)}>
                <div style={taskIcon(doneFollow)}>{doneFollow ? '✅' : '🐦'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Follow on X</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Follow @TheChillBugs on X</div>
                </div>
                {!doneFollow && <button onClick={() => { window.open('https://twitter.com/TheChillBugs', '_blank'); setClickedFollow(true) }} style={goBtn}>Go →</button>}
                {doneFollow && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Done ✓</span>}
              </div>
              {!doneFollow && clickedFollow && (
                <button onClick={() => setDoneFollow(true)} style={markBtn}>✓ I've followed @TheChillBugs — mark as done</button>
              )}

              {/* Task 2 - Repost */}
              <div style={taskRow(doneRepost, !doneFollow ? 0.4 : 1)}>
                <div style={taskIcon(doneRepost)}>{doneRepost ? '✅' : '🔁'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Like & Repost</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Like & repost the pinned tweet</div>
                </div>
                {doneFollow && !doneRepost && <button onClick={() => { window.open(tweetUrl, '_blank'); setClickedRepost(true) }} style={goBtn}>Go →</button>}
                {doneRepost && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Done ✓</span>}
              </div>
              {doneFollow && !doneRepost && clickedRepost && (
                <button onClick={() => setDoneRepost(true)} style={markBtn}>✓ I've liked & reposted — mark as done</button>
              )}

              {/* Task 3 - Quote Tweet */}
              <div style={taskRow(doneQuote, !doneRepost ? 0.4 : 1)}>
                <div style={taskIcon(doneQuote)}>{doneQuote ? '✅' : '💬'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Quote Tweet</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Quote our tweet & tag 2 friends</div>
                </div>
                {doneRepost && !doneQuote && (
                  <button onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Just joined the @TheChillBugs Buglist! 🐛\n\nSecure your WL spot — tag 2 friends below 👇\nJoin here: ' + (typeof window !== 'undefined' ? window.location.origin : 'https://chillbugs.xyz') + '?wlref=' + form.x_username.replace('@',''))}&url=${encodeURIComponent(tweetUrl)}`, '_blank')
                    setClickedQuote(true)
                  }} style={goBtn}>Quote →</button>
                )}
                {doneQuote && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Done ✓</span>}
              </div>
              {doneRepost && !doneQuote && clickedQuote && (
                <button onClick={() => setDoneQuote(true)} style={markBtn}>✓ I've quoted the tweet — mark as done</button>
              )}

              {/* Task 4 - Tag friends */}
              <div style={taskRow(doneTag, !doneQuote ? 0.4 : 1)}>
                <div style={taskIcon(doneTag)}>{doneTag ? '✅' : '🏷️'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Tag 2 Friends</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Tag 2 friends in the comments</div>
                </div>
                {doneQuote && !doneTag && <button onClick={() => { window.open(tweetUrl, '_blank'); setClickedTag(true) }} style={goBtn}>Go →</button>}
                {doneTag && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Done ✓</span>}
              </div>
              {doneQuote && !doneTag && clickedTag && (
                <button onClick={() => setDoneTag(true)} style={markBtn}>✓ I've tagged 2 friends — mark as done</button>
              )}

              {/* Task 5 - Verify comment */}
              <div style={{ padding: '14px', borderRadius: '14px', border: `1px solid ${commentVerified ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`, background: commentVerified ? 'rgba(0,255,135,0.03)' : '#0a0a0a', opacity: !doneTag ? 0.4 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: doneTag && !commentVerified ? '12px' : '0' }}>
                  <div style={taskIcon(commentVerified)}>{commentVerified ? '✅' : '🔗'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Verify Your Comment</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Paste your comment link to verify</div>
                  </div>
                  {commentVerified && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Verified ✓</span>}
                </div>
                {doneTag && !commentVerified && (
                  <div>
                    <input style={{ ...inputStyle, marginTop: '0' }} placeholder="https://x.com/your_handle/status/..." value={commentLink} onChange={e => setCommentLink(e.target.value)} />
                    {commentError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0' }}>{commentError}</p>}
                    <button onClick={verifyComment} style={{ width: '100%', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', color: '#00ff87', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
                      Verify Comment Link
                    </button>
                  </div>
                )}
              </div>

              <button style={allTasksDone ? btnStyle : btnDisabled} onClick={() => allTasksDone && setStep(3)}>
                Continue to Wallet →
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={cardStyle}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Back</button>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>💎</div>
                <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>Almost There!</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Enter your wallet to claim your spot.</p>
              </div>
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,135,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 8px', letterSpacing: '2px' }}>ALL TASKS COMPLETED</p>
                {['Followed @TheChillBugs', 'Liked & reposted pinned tweet', 'Quoted the tweet & tagged friends', 'Tagged 2 friends in comments', 'Comment link verified'].map(t => (
                  <div key={t} style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>✅ {t}</div>
                ))}
              </div>
              <label style={labelStyle}>WALLET ADDRESS *</label>
              <input style={inputStyle} placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '6px 0 0' }}>This is where your WL spot will be assigned at mint.</p>
              {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
              <button style={submitting ? btnDisabled : btnStyle} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : '🐛 Claim My Spot'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
