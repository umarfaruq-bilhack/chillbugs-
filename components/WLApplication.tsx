'use client'

import { useState } from 'react'

export function WLApplication({ tweetUrl = 'https://twitter.com/TheChillBugs' }: { tweetUrl?: string }) {
  const [step, setStep] = useState(1)
  const [doneFollow, setDoneFollow] = useState(false)
  const [doneRepost, setDoneRepost] = useState(false)
  const [doneTag, setDoneTag] = useState(false)
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

  const verifyComment = () => {
    const url = commentLink.trim()
    if (!url) { setCommentError('Please paste your comment link'); return }
    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      setCommentError('Please paste a valid X/Twitter link')
      return
    }
    setCommentError('')
    setCommentVerified(true)
  }

  const allTasksDone = doneFollow && doneRepost && doneTag && commentVerified

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

  // Success screen
  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'var(--font-display, sans-serif)' }}>
        <div style={{ width:'100%', maxWidth:'460px', background:'#111', border:'1px solid #2a2a2a', borderRadius:'24px', padding:'40px 32px', textAlign:'center' }}>
          <div style={{ fontSize:'72px', marginBottom:'16px' }}><img src="/chillbug-clean.png" alt="Chill Bug" style={{ width:'100px', height:'100px', objectFit:'contain' }} /></div>
          <h1 style={{ color:'#00ff87', fontSize:'32px', fontWeight:900, margin:'0 0 8px', letterSpacing:'-1px' }}>YOU'VE JOINED THE BUGLIST!</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'15px', margin:'0 0 24px' }}>Your application is confirmed. Share your link to refer friends!</p>

          <div style={{ background:'#0a0a0a', border:'1px solid rgba(0,255,135,0.2)', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:'0 0 8px' }}>YOUR REFERRAL LINK</p>
            <p style={{ color:'#00ff87', fontSize:'13px', fontFamily:'monospace', margin:'0 0 12px', wordBreak:'break-all' }}>{referralLink}</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={copyLink} style={{ flex:1, background:'rgba(0,255,135,0.1)', border:'1px solid rgba(0,255,135,0.2)', color:'#00ff87', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button onClick={shareOnX} style={{ flex:1, background:'white', border:'none', color:'black', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </button>
            </div>
          </div>

          <div style={{ background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:'14px', padding:'16px', textAlign:'left', fontSize:'13px' }}>
            <div style={{ color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}><span style={{ color:'rgba(255,255,255,0.7)' }}>X:</span> @{form.x_username.replace('@','')}</div>
            {form.discord_username && <div style={{ color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}><span style={{ color:'rgba(255,255,255,0.7)' }}>Discord:</span> {form.discord_username}</div>}
            <div style={{ color:'rgba(255,255,255,0.4)' }}><span style={{ color:'rgba(255,255,255,0.7)' }}>Wallet:</span> {wallet.slice(0,8)}...{wallet.slice(-6)}</div>
          </div>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'12px', marginTop:'16px' }}>Follow <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" style={{ color:'#00ff87' }}>@TheChillBugs</a> for updates. Stay Chill. 🐛</p>
        </div>
      </div>
    )
  }

  const navStyle: React.CSSProperties = { minHeight:'100vh', background:'#0a0a0a', fontFamily:'var(--font-display, sans-serif)', display:'flex', flexDirection:'column' }
  const cardStyle: React.CSSProperties = { background:'#111', border:'1px solid #2a2a2a', borderRadius:'24px', padding:'28px 32px', width:'100%', maxWidth:'460px', margin:'0 auto' }
  const inputStyle: React.CSSProperties = { width:'100%', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'12px 16px', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box' as const, marginTop:'6px' }
  const labelStyle: React.CSSProperties = { color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'2px', display:'block', marginTop:'14px' }
  const btnStyle: React.CSSProperties = { width:'100%', background:'#00ff87', color:'#000', border:'none', borderRadius:'14px', padding:'14px', fontSize:'16px', fontWeight:900, cursor:'pointer', marginTop:'20px' }
  const btnDisabled: React.CSSProperties = { ...btnStyle, background:'#2a2a2a', color:'rgba(255,255,255,0.2)', cursor:'not-allowed' }

  return (
    <div style={navStyle}>
      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 32px', maxWidth:'600px', margin:'0 auto', width:'100%', boxSizing:'border-box' as const }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width:'28px', height:'28px', objectFit:'contain' }} />
          <span style={{ color:'white', fontWeight:900, fontSize:'16px', letterSpacing:'-0.5px' }}>CHILL BUGS</span>
        </div>
        <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none' }}>@TheChillBugs</a>
      </div>

      {/* Header */}
      <div style={{ textAlign:'center', padding:'0 16px 20px' }}>
        <h1 style={{ color:'white', fontSize:'28px', fontWeight:900, margin:'0 0 6px', letterSpacing:'-1px' }}>JOIN THE BUGLIST</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>Complete 3 simple steps to secure your spot</p>
      </div>

      {/* Step dots */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0', marginBottom:'24px' }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, background: s < step ? '#00ff87' : s === step ? '#00ff87' : '#2a2a2a', color: s <= step ? '#000' : 'rgba(255,255,255,0.3)' }}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div style={{ width:'60px', height:'2px', background: s < step ? '#00ff87' : '#2a2a2a' }} />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'0 16px 40px' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width:'52px', height:'52px', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:'12px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width:'44px', height:'44px', objectFit:'contain', opacity: 0.6 + (i * 0.1) }} />
                </div>
              ))}
            </div>
            <h2 style={{ color:'white', fontSize:'22px', fontWeight:900, margin:'0 0 4px' }}>Your Details</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:'0 0 4px' }}>Enter your socials so we can verify your tasks.</p>

            <label style={labelStyle}>X (TWITTER) USERNAME *</label>
            <input style={inputStyle} placeholder="@your_handle" value={form.x_username} onChange={e => setForm(f => ({...f, x_username: e.target.value}))} />
            <label style={labelStyle}>DISCORD USERNAME</label>
            <input style={inputStyle} placeholder="username#0000" value={form.discord_username} onChange={e => setForm(f => ({...f, discord_username: e.target.value}))} />
            <label style={labelStyle}>REFERRAL CODE (OPTIONAL)</label>
            <input style={inputStyle} placeholder="friend's code" value={form.referral_code} onChange={e => setForm(f => ({...f, referral_code: e.target.value}))} />

            {error && <p style={{ color:'#ef4444', fontSize:'13px', marginTop:'12px' }}>{error}</p>}

            <button style={btnStyle} onClick={() => {
              if (!form.x_username) { setError('X username is required'); return }
              setError('')
              setStep(2)
            }}>Continue →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={cardStyle}>
            <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'13px', cursor:'pointer', padding:0, marginBottom:'16px' }}>← Back</button>
            <h2 style={{ color:'white', fontSize:'22px', fontWeight:900, margin:'0 0 4px' }}>Social Tasks</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:'0 0 20px' }}>Complete all tasks in order to continue.</p>

            {/* Task 1 - Follow */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', borderRadius:'14px', border:`1px solid ${doneFollow ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`, background: doneFollow ? 'rgba(0,255,135,0.03)' : '#0a0a0a', marginBottom:'10px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: doneFollow ? 'rgba(0,255,135,0.1)' : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                {doneFollow ? '✅' : '🐦'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'white', fontSize:'14px', fontWeight:600 }}>Follow on X</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>Follow @TheChillBugs on X</div>
              </div>
              {!doneFollow ? (
                <button onClick={() => { window.open('https://twitter.com/TheChillBugs', '_blank') }} style={{ padding:'8px 16px', borderRadius:'10px', background:'#00ff87', color:'#000', border:'none', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  Go →
                </button>
              ) : null}
              {doneFollow && <span style={{ color:'#00ff87', fontSize:'13px', fontWeight:700 }}>Done ✓</span>}
            </div>

            {/* Mark follow done button */}
            {!doneFollow && (
              <button onClick={() => setDoneFollow(true)} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a2a', color:'rgba(255,255,255,0.5)', borderRadius:'10px', padding:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'10px' }}>
                ✓ I've followed @TheChillBugs — mark as done
              </button>
            )}

            {/* Task 2 - Repost */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', borderRadius:'14px', border:`1px solid ${doneRepost ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`, background: doneRepost ? 'rgba(0,255,135,0.03)' : '#0a0a0a', marginBottom:'10px', opacity: !doneFollow ? 0.4 : 1 }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: doneRepost ? 'rgba(0,255,135,0.1)' : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                {doneRepost ? '✅' : '🔁'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'white', fontSize:'14px', fontWeight:600 }}>Like & Repost</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>Like & repost the pinned tweet</div>
              </div>
              {doneFollow && !doneRepost && (
                <button onClick={() => { window.open('https://twitter.com/TheChillBugs', '_blank') }} style={{ padding:'8px 16px', borderRadius:'10px', background:'#00ff87', color:'#000', border:'none', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  Go →
                </button>
              )}
              {doneRepost && <span style={{ color:'#00ff87', fontSize:'13px', fontWeight:700 }}>Done ✓</span>}
            </div>
            {doneFollow && !doneRepost && (
              <button onClick={() => setDoneRepost(true)} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a2a', color:'rgba(255,255,255,0.5)', borderRadius:'10px', padding:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'10px' }}>
                ✓ I've liked & reposted — mark as done
              </button>
            )}

            {/* Task 3 - Tag friends */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', borderRadius:'14px', border:`1px solid ${doneTag ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`, background: doneTag ? 'rgba(0,255,135,0.03)' : '#0a0a0a', marginBottom:'10px', opacity: !doneRepost ? 0.4 : 1 }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: doneTag ? 'rgba(0,255,135,0.1)' : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                {doneTag ? '✅' : '🏷️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'white', fontSize:'14px', fontWeight:600 }}>Tag 2 Friends</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>Tag 2 friends in the comments</div>
              </div>
              {doneRepost && !doneTag && (
                <button onClick={() => { window.open('https://twitter.com/TheChillBugs', '_blank') }} style={{ padding:'8px 16px', borderRadius:'10px', background:'#00ff87', color:'#000', border:'none', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  Go →
                </button>
              )}
              {doneTag && <span style={{ color:'#00ff87', fontSize:'13px', fontWeight:700 }}>Done ✓</span>}
            </div>
            {doneRepost && !doneTag && (
              <button onClick={() => setDoneTag(true)} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a2a', color:'rgba(255,255,255,0.5)', borderRadius:'10px', padding:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'10px' }}>
                ✓ I've tagged 2 friends — mark as done
              </button>
            )}

            {/* Task 4 - Verify comment link */}
            <div style={{ padding:'14px', borderRadius:'14px', border:`1px solid ${commentVerified ? 'rgba(0,255,135,0.3)' : '#2a2a2a'}`, background: commentVerified ? 'rgba(0,255,135,0.03)' : '#0a0a0a', opacity: !doneTag ? 0.4 : 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom: doneTag && !commentVerified ? '12px' : '0' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background: commentVerified ? 'rgba(0,255,135,0.1)' : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                  {commentVerified ? '✅' : '🔗'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'white', fontSize:'14px', fontWeight:600 }}>Verify Your Comment</div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>Paste your comment link to verify you tagged 2 friends</div>
                </div>
                {commentVerified && <span style={{ color:'#00ff87', fontSize:'13px', fontWeight:700 }}>Verified ✓</span>}
              </div>
              {doneTag && !commentVerified && (
                <div>
                  <input
                    style={{ ...inputStyle, marginTop:'0' }}
                    placeholder="https://x.com/your_handle/status/..."
                    value={commentLink}
                    onChange={e => setCommentLink(e.target.value)}
                  />
                  {commentError && <p style={{ color:'#ef4444', fontSize:'12px', margin:'6px 0 0' }}>{commentError}</p>}
                  <button onClick={verifyComment} style={{ width:'100%', background:'rgba(0,255,135,0.1)', border:'1px solid rgba(0,255,135,0.2)', color:'#00ff87', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', marginTop:'10px' }}>
                    Verify Comment Link
                  </button>
                </div>
              )}
            </div>

            <button
              style={allTasksDone ? btnStyle : btnDisabled}
              onClick={() => allTasksDone && setStep(3)}
            >
              Continue to Wallet →
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={cardStyle}>
            <button onClick={() => setStep(2)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'13px', cursor:'pointer', padding:0, marginBottom:'16px' }}>← Back</button>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'48px', marginBottom:'8px' }}>💎</div>
              <h2 style={{ color:'white', fontSize:'22px', fontWeight:900, margin:'0 0 4px' }}>Almost There!</h2>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>Enter your wallet to claim your spot.</p>
            </div>

            <div style={{ background:'#0a0a0a', border:'1px solid rgba(0,255,135,0.2)', borderRadius:'14px', padding:'12px 16px', marginBottom:'20px' }}>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:'0 0 4px' }}>ALL TASKS COMPLETED</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', fontSize:'13px' }}>
                <span style={{ color:'rgba(255,255,255,0.6)' }}>✅ Followed @TheChillBugs</span>
                <span style={{ color:'rgba(255,255,255,0.6)' }}>✅ Liked & reposted pinned tweet</span>
                <span style={{ color:'rgba(255,255,255,0.6)' }}>✅ Tagged 2 friends in comments</span>
                <span style={{ color:'rgba(255,255,255,0.6)' }}>✅ Comment link verified</span>
              </div>
            </div>

            <label style={labelStyle}>WALLET ADDRESS *</label>
            <input style={inputStyle} placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px', margin:'6px 0 0' }}>This is where your WL spot will be assigned at mint.</p>

            {error && <p style={{ color:'#ef4444', fontSize:'13px', marginTop:'12px' }}>{error}</p>}

            <button style={submitting ? btnDisabled : btnStyle} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '🐛 Claim My Spot'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
