'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

interface Bug {
  id: number
  x: number
  y: number
  emoji: string
  speed: number
  direction: number
  caught: boolean
  isDanger: boolean
}

const BUG_EMOJIS = ['🐛', '🐞', '🦗', '🪲', '🦟', '🐝']
const DANGER_EMOJIS = ['💀', '☠️', '🔴']
const GAME_DURATION = 30
const BUGS_TO_WIN = 10

// Sound engine using Web Audio API
function createSoundEngine() {
  if (typeof window === 'undefined') return null
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = type
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    }

    return {
      catchBug: () => {
        playTone(600, 0.1, 'sine', 0.3)
        setTimeout(() => playTone(900, 0.1, 'sine', 0.2), 80)
      },
      dangerBug: () => {
        playTone(200, 0.15, 'sawtooth', 0.4)
        setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.3), 100)
      },
      gameStart: () => {
        [400, 500, 600, 800].forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 80)
        })
      },
      gameWin: () => {
        [500, 600, 700, 900, 1100].forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 100)
        })
      },
      gameLose: () => {
        [400, 300, 200].forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.2, 'sawtooth', 0.3), i * 120)
        })
      },
      tick: () => playTone(440, 0.05, 'square', 0.1),
    }
  } catch {
    return null
  }
}

// Vibration helper
function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function BugCatcherGame() {
  const router = useRouter()
  const { showToast } = useToast()
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [bugs, setBugs] = useState<Bug[]>([])
  const [caught, setCaught] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; danger: boolean }[]>([])
  const [soundOn, setSoundOn] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const bugsRef = useRef<Bug[]>([])
  const nextIdRef = useRef(0)
  const soundRef = useRef<ReturnType<typeof createSoundEngine>>(null)

  useEffect(() => {
    soundRef.current = createSoundEngine()
  }, [])

  const sound = useCallback(() => soundOn ? soundRef.current : null, [soundOn])

  const spawnBug = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const { width, height } = container.getBoundingClientRect()
    const isDanger = Math.random() < 0.25
    const bug: Bug = {
      id: nextIdRef.current++,
      x: Math.random() * (width - 60),
      y: Math.random() * (height - 60),
      emoji: isDanger
        ? DANGER_EMOJIS[Math.floor(Math.random() * DANGER_EMOJIS.length)]
        : BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)],
      speed: isDanger ? 90 + Math.random() * 60 : 60 + Math.random() * 80,
      direction: Math.random() * Math.PI * 2,
      caught: false,
      isDanger,
    }
    bugsRef.current = [...bugsRef.current, bug]
    setBugs([...bugsRef.current])
  }, [])

  const startGame = useCallback(() => {
    bugsRef.current = []
    nextIdRef.current = 0
    setBugs([])
    setCaught(0)
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setClaimed(false)
    setParticles([])
    setGameState('playing')
    sound()?.gameStart()
    setTimeout(() => {
      for (let i = 0; i < 6; i++) spawnBug()
    }, 100)
  }, [spawnBug, sound])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp
      const container = containerRef.current
      if (!container) return
      const { width, height } = container.getBoundingClientRect()
      bugsRef.current = bugsRef.current.map(bug => {
        if (bug.caught) return bug
        let newX = bug.x + Math.cos(bug.direction) * bug.speed * delta
        let newY = bug.y + Math.sin(bug.direction) * bug.speed * delta
        let newDir = bug.direction
        if (newX < 0 || newX > width - 50) newDir = Math.PI - newDir
        if (newY < 0 || newY > height - 50) newDir = -newDir
        newX = Math.max(0, Math.min(width - 50, newX))
        newY = Math.max(0, Math.min(height - 50, newY))
        if (Math.random() < 0.01) newDir = Math.random() * Math.PI * 2
        return { ...bug, x: newX, y: newY, direction: newDir }
      })
      setBugs([...bugsRef.current])
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      lastTimeRef.current = 0
    }
  }, [gameState])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 6 && t > 1) sound()?.tick()
        if (t <= 1) {
          clearInterval(timer)
          setGameState(prev => prev === 'playing' ? 'lost' : prev)
          sound()?.gameLose()
          vibrate([100, 50, 100, 50, 200])
          return 0
        }
        return t - 1
      })
    }, 1000)
    const spawner = setInterval(spawnBug, 3000)
    return () => { clearInterval(timer); clearInterval(spawner) }
  }, [gameState, spawnBug, sound])

  const catchBug = useCallback((bugId: number, x: number, y: number, isDanger: boolean) => {
    if (gameState !== 'playing') return
    bugsRef.current = bugsRef.current.map(b => b.id === bugId ? { ...b, caught: true } : b)
    setBugs([...bugsRef.current])

    const particleId = Date.now()
    setParticles(prev => [...prev, { id: particleId, x, y, danger: isDanger }])
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== particleId)), 600)
    setTimeout(() => {
      bugsRef.current = bugsRef.current.filter(b => b.id !== bugId)
      setBugs([...bugsRef.current])
    }, 300)

    if (isDanger) {
      sound()?.dangerBug()
      vibrate([50, 30, 50, 30, 50, 30, 100]) // rapid intense vibration
      setCaught(prev => Math.max(0, prev - 1))
      setScore(prev => Math.max(0, prev - 10))
    } else {
      sound()?.catchBug()
      vibrate(30) // short satisfying buzz
      setCaught(prev => {
        const newCount = prev + 1
        setScore(newCount * 10)
        if (newCount >= BUGS_TO_WIN) {
          setGameState('won')
          sound()?.gameWin()
          vibrate([50, 50, 50, 50, 200]) // celebration pattern
        }
        return newCount
      })
    }
  }, [gameState, sound])

  const claimPoints = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bug_catcher_game' }),
      })
      if (res.ok) {
        setClaimed(true)
        showToast('Bug Catcher complete!', 'success', 50)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setClaiming(false)
    }
  }

  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-orange-400' : 'text-[#00ff87]'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <span>←</span>
          <span className="text-sm">Back to dashboard</span>
        </a>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundOn(s => !s)}
            className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1.5"
          >
            {soundOn ? '🔊' : '🔇'} {soundOn ? 'Sound On' : 'Sound Off'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐛</span>
            <span className="font-display font-bold tracking-tight">CHILL BUGS</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Idle */}
        {gameState === 'idle' && (
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6 float-1 inline-block">🐛</div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-4">BUG CATCHER</h1>
            <p className="text-white/50 text-lg mb-4">
              Catch <span className="text-[#00ff87] font-bold">10 bugs</span> in <span className="text-[#00ff87] font-bold">30 seconds</span> to earn
            </p>
            <div className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-6 py-3 mb-8">
              <span className="text-2xl">⚡</span>
              <span className="font-display font-black text-2xl text-[#00ff87]">+50 Bug Points</span>
            </div>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 mb-8 text-left">
              <h3 className="font-bold text-white mb-3">How to play:</h3>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>👆 Tap / click bugs to catch them</li>
                <li>🏃 Bugs move faster as time runs out</li>
                <li>🎯 Catch 10 bugs before timer hits 0</li>
                <li>💀 <span className="text-red-400 font-semibold">Avoid danger bugs</span> — red glow, reduce count by 1!</li>
                <li>📳 Your device will vibrate on hits</li>
                <li>🔊 Toggle sound in the top right</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105 glow-btn"
            >
              START GAME
            </button>
          </div>
        )}

        {/* Playing */}
        {gameState === 'playing' && (
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">Caught:</span>
                <span className="font-display font-black text-2xl text-[#00ff87]">{caught}</span>
                <span className="text-white/30 text-sm">/ {BUGS_TO_WIN}</span>
              </div>
              <div className={`font-display font-black text-3xl ${timerColor} transition-colors`}>
                {timeLeft}s
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">Score:</span>
                <span className="font-display font-black text-2xl text-white">{score}</span>
              </div>
            </div>

            <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-[#00ff87] rounded-full transition-all" style={{ width: `${(caught / BUGS_TO_WIN) * 100}%` }} />
            </div>

            <div
              ref={containerRef}
              className="relative bg-[#111111] border-2 border-[#2a2a2a] rounded-3xl overflow-hidden select-none"
              style={{ height: '420px' }}
            >
              <div className="absolute inset-0 grid-bg opacity-50" />

              {bugs.map(bug => (
                <button
                  key={bug.id}
                  onClick={() => catchBug(bug.id, bug.x, bug.y, bug.isDanger)}
                  className={`absolute text-4xl transition-all duration-150 hover:scale-125 active:scale-75
                    ${bug.caught ? 'opacity-0 scale-150' : 'opacity-100'}`}
                  style={{
                    left: bug.x,
                    top: bug.y,
                    transform: `rotate(${bug.direction * (180 / Math.PI)}deg)`,
                    cursor: 'crosshair',
                    filter: bug.isDanger ? 'drop-shadow(0 0 8px #ff4444)' : undefined,
                  }}
                >
                  {bug.emoji}
                </button>
              ))}

              {particles.map(p => (
                <div
                  key={p.id}
                  className={`absolute pointer-events-none text-2xl animate-ping`}
                  style={{ left: p.x, top: p.y }}
                >
                  {p.danger ? '💥' : '✨'}
                </div>
              ))}

              {timeLeft <= 5 && (
                <div className="absolute inset-0 border-4 border-red-500/50 rounded-3xl animate-pulse pointer-events-none" />
              )}

              {/* Danger bug warning */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                <span className="text-xs text-white/40">💀 = danger</span>
                <span className="text-xs text-white/20">|</span>
                <span className="text-xs text-white/40">🐛 = catch</span>
              </div>
            </div>
          </div>
        )}

        {/* Won */}
        {gameState === 'won' && (
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-[#00ff87] mb-3">YOU WIN!</h1>
            <p className="text-white/60 text-lg mb-2">You caught {caught} bugs in {GAME_DURATION - timeLeft}s!</p>
            <div className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-6 py-3 mb-8">
              <span className="text-2xl">⚡</span>
              <span className="font-display font-black text-2xl text-[#00ff87]">+50 Bug Points</span>
            </div>
            <div className="flex flex-col gap-3">
              {!claimed ? (
                <button onClick={claimPoints} disabled={claiming} className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 glow-btn">
                  {claiming ? 'Claiming...' : '⚡ Claim 50 Points'}
                </button>
              ) : (
                <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-2xl px-12 py-4 text-[#00ff87] font-bold text-lg">
                  ✅ Points claimed! Redirecting...
                </div>
              )}
              <button onClick={startGame} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Play again (no extra points)
              </button>
            </div>
          </div>
        )}

        {/* Lost */}
        {gameState === 'lost' && (
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">😔</div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3">SO CLOSE!</h1>
            <p className="text-white/60 text-lg mb-2">You caught <span className="text-[#00ff87] font-bold">{caught}</span> out of {BUGS_TO_WIN} bugs</p>
            <p className="text-white/40 text-sm mb-8">You need 10 bugs to earn the points. Try again!</p>
            <div className="flex flex-col gap-3">
              <button onClick={startGame} className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105 glow-btn">
                TRY AGAIN
              </button>
              <a href="/dashboard" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Back to dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
