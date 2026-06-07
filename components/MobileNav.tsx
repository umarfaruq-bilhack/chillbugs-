'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const drawer = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}
      />
      {/* Drawer */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '280px',
        height: '100%',
        background: '#000000',
        borderLeft: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000000,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🐛</span>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', letterSpacing: '-0.3px' }}>CHILL BUGS</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Links */}
        <div style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { label: 'The World', href: '#how-it-works', icon: '🌿' },
            { label: 'Earn WL', href: '#earn-wl', icon: '⚡' },
            { label: 'Leaderboard', href: '/dashboard?tab=leaderboard', icon: '🏆' },
            { label: '@TheChillBugs', href: 'https://twitter.com/TheChillBugs', icon: '🐦', external: true },
          ].map(link => (
            <a key={link.label} href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}
            >
              <span style={{ fontSize: '18px' }}>{link.icon}</span>
              <span>{link.label}</span>
              {link.external && <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>↗</span>}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#222', margin: '0 24px' }} />

        {/* CTA */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="/dashboard" onClick={() => setOpen(false)}
            style={{ background: '#00ff87', color: '#000', fontWeight: 900, textAlign: 'center', padding: '13px', borderRadius: '12px', textDecoration: 'none', display: 'block', fontSize: '15px' }}
          >
            Dashboard
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff87' }} />
            <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 500 }}>512 WL spots left</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '0 24px 32px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none' }}>Terms</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}
      >
        <span style={{ display: 'block', width: '24px', height: '2px', background: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '24px', height: '2px', background: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '16px', height: '2px', background: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
      </button>
      {mounted && open && createPortal(drawer, document.body)}
    </>
  )
}
