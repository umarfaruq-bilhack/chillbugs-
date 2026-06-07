import { ImageResponse } from '@vercel/og'
import { BUG_IMAGE } from './bugimage'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 80px',
        }}
      >
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,255,135,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow behind bug */}
        <div style={{
          position: 'absolute', right: '120px', top: '50%',
          transform: 'translateY(-50%)',
          width: '360px', height: '360px',
          background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        {/* Left — text */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
          {/* Logo row with real bug image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img src={BUG_IMAGE} width={70} height={70} style={{ objectFit: 'contain' }} />
            <span style={{ color: '#ffffff', fontSize: '52px', fontWeight: 900, letterSpacing: '-2px' }}>CHILL BUGS</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,255,135,0.1)',
            border: '1px solid rgba(0,255,135,0.25)',
            borderRadius: '99px', padding: '8px 20px',
            marginBottom: '28px', width: 'fit-content',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff87' }} />
            <span style={{ color: '#00ff87', fontSize: '18px', fontWeight: 600 }}>Season 1 — Now Live</span>
          </div>

          {/* Title */}
          <span style={{ color: '#ffffff', fontSize: '72px', fontWeight: 900, lineHeight: 1, letterSpacing: '-3px', marginBottom: '8px' }}>
            CHILL BUGS
          </span>
          <span style={{ color: '#00ff87', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '24px' }}>
            ENTER THE PLAYGROUND
          </span>

          {/* Description */}
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', lineHeight: 1.5, margin: '0 0 36px 0', maxWidth: '500px' }}>
            Play games · Complete quests · Refer friends · Earn your WL spot.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
            {[
              { value: '4,000', label: 'SUPPLY' },
              { value: '+50 PTS', label: 'PER GAME' },
              { value: 'FREE', label: 'TO JOIN' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#ffffff', fontSize: '26px', fontWeight: 900 }}>{s.value}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: '#00ff87', borderRadius: '14px', padding: '14px 36px', display: 'flex', width: 'fit-content' }}>
            <span style={{ color: '#000000', fontSize: '22px', fontWeight: 900 }}>chillbugs.xyz →</span>
          </div>
        </div>

        {/* Right — Big Bug image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '320px', flexShrink: 0, zIndex: 1 }}>
          <img src={BUG_IMAGE} width={300} height={300} style={{ objectFit: 'contain' }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
