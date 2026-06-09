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
  isBoss: boolean
}

const BUG_EMOJIS = ['🐛', '🐞', '🦗', '🪲', '🦟', '🐝']
const DANGER_EMOJIS = ['💀', '☠️', '🔴']
const BOSS_EMOJI = '👾'

interface LevelConfig {
  level: number
  bugsToWin: number
  timeLimit: number
  dangerChance: number
  speedMultiplier: number
  hasBoss: boolean
  pointsReward: number
  title: string
  description: string
  bgColor: string
}

const LEVELS: LevelConfig[] = [
  { level: 1, bugsToWin: 10, timeLimit: 35, dangerChance: 0.10, speedMultiplier: 1.0, hasBoss: false, pointsReward: 50, title: 'ROOKIE BUG HUNTER', description: 'Catch 10 bugs in 35 seconds', bgColor: '#0a0a0a' },
  { level: 2, bugsToWin: 12, timeLimit: 35, dangerChance: 0.12, speedMultiplier: 1.1, hasBoss: false, pointsReward: 60, title: 'BUG APPRENTICE', description: 'Bugs move a little faster', bgColor: '#0a0a0f' },
  { level: 3, bugsToWin: 14, timeLimit: 35, dangerChance: 0.15, speedMultiplier: 1.2, hasBoss: false, pointsReward: 75, title: 'BUG TRACKER', description: 'Watch out for danger bugs!', bgColor: '#0a0f0a' },
  { level: 4, bugsToWin: 16, timeLimit: 33, dangerChance: 0.18, speedMultiplier: 1.3, hasBoss: false, pointsReward: 90, title: 'BUG SLAYER', description: 'Getting faster now!', bgColor: '#0f0a0a' },
  { level: 5, bugsToWin: 18, timeLimit: 33, dangerChance: 0.20, speedMultiplier: 1.4, hasBoss: true, pointsReward: 110, title: 'BOSS ENCOUNTER', description: '⚠️ First boss bug appears!', bgColor: '#0f0a0f' },
  { level: 6, bugsToWin: 20, timeLimit: 32, dangerChance: 0.22, speedMultiplier: 1.5, hasBoss: true, pointsReward: 130, title: 'BUG COMMANDER', description: 'Speed and danger increase!', bgColor: '#0a0f0f' },
  { level: 7, bugsToWin: 22, timeLimit: 30, dangerChance: 0.25, speedMultiplier: 1.65, hasBoss: true, pointsReward: 155, title: 'SWARM MASTER', description: 'The swarm is intense!', bgColor: '#0f0f0a' },
  { level: 8, bugsToWin: 25, timeLimit: 28, dangerChance: 0.28, speedMultiplier: 1.8, hasBoss: true, pointsReward: 180, title: 'ELITE HUNTER', description: 'Only the best survive', bgColor: '#100a0a' },
  { level: 9, bugsToWin: 28, timeLimit: 26, dangerChance: 0.32, speedMultiplier: 2.0, hasBoss: true, pointsReward: 210, title: 'LEGENDARY HUNTER', description: 'Near impossible...', bgColor: '#100010' },
  { level: 10, bugsToWin: 32, timeLimit: 25, dangerChance: 0.38, speedMultiplier: 2.3, hasBoss: true, pointsReward: 300, title: 'GRANDMASTER', description: '🏆 The ultimate challenge!', bgColor: '#0a0010' },
]

function createSoundEngine() {
  if (typeof window === 'undefined') return null
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const play = (freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = type
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      osc.start(); osc.stop(ctx.currentTime + dur)
    }
    return {
      catchBug: () => { play(600, 0.1, 'sine', 0.25); setTimeout(() => play(900, 0.1, 'sine', 0.2), 80) },
      dangerBug: () => { play(200, 0.15, 'sawtooth', 0.4); setTimeout(() => play(150, 0.2, 'sawtooth', 0.3), 100) },
      bossBug: () => { play(100, 0.3, 'sawtooth', 0.5); setTimeout(() => play(80, 0.4, 'sawtooth', 0.4), 150) },
      gameStart: () => [400, 500, 600, 800].forEach((f, i) => setTimeout(() => play(f, 0.15, 'sine', 0.2), i * 80)),
      gameWin: () => [500, 600, 700, 900, 1100].forEach((f, i) => setTimeout(() => play(f, 0.2, 'sine', 0.25), i * 100)),
      levelUp: () => [600, 800, 1000, 1200].forEach((f, i) => setTimeout(() => play(f, 0.15, 'sine', 0.3), i * 80)),
      gameLose: () => [400, 300, 200].forEach((f, i) => setTimeout(() => play(f, 0.2, 'sawtooth', 0.3), i * 120)),
      tick: () => play(440, 0.05, 'square', 0.1),
    }
  } catch { return null }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

interface Props {
  userLevel?: number
}

export function BugCatcherGame({ userLevel = 1 }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [selectedLevel, setSelectedLevel] = useState(userLevel)
  const [gameState, setGameState] = useState<'select' | 'playing' | 'won' | 'lost'>('select')
  const [bugs, setBugs] = useState<Bug[]>([])
  const [caught, setCaught] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
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

  useEffect(() => { soundRef.current = createSoundEngine() }, [])

  const sound = useCallback(() => soundOn ? soundRef.current : null, [soundOn])
  const config = LEVELS[selectedLevel - 1]

  const spawnBug = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    // Don't spawn too many bugs at once
    const maxOnScreen = 8 + selectedLevel
    if (bugsRef.current.filter(b => !b.caught).length >= maxOnScreen) return
    const { width, height } = container.getBoundingClientRect()
    const rand = Math.random()
    const isDanger = rand < config.dangerChance
    const isBoss = config.hasBoss && rand > 0.92

    const bug: Bug = {
      id: nextIdRef.current++,
      x: Math.random() * (width - 60),
      y: Math.random() * (height - 60),
      emoji: isBoss ? BOSS_EMOJI : isDanger ? DANGER_EMOJIS[Math.floor(Math.random() * DANGER_EMOJIS.length)] : BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)],
      speed: (isDanger ? 90 : isBoss ? 120 : 60) * config.speedMultiplier + Math.random() * 40,
      direction: Math.random() * Math.PI * 2,
      caught: false, isDanger, isBoss,
    }
    bugsRef.current = [...bugsRef.current, bug]
    setBugs([...bugsRef.current])
  }, [config])

  const startGame = useCallback(() => {
    bugsRef.current = []; nextIdRef.current = 0
    setBugs([]); setCaught(0); setTimeLeft(config.timeLimit)
    setScore(0); setClaimed(false); setParticles([])
    setGameState('playing')
    sound()?.gameStart()
    // Spawn more bugs at start based on level
    const initialBugs = Math.min(4 + selectedLevel, 10)
    setTimeout(() => { for (let i = 0; i < initialBugs; i++) spawnBug() }, 100)
  }, [spawnBug, sound, config])

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
    return () => { cancelAnimationFrame(animFrameRef.current); lastTimeRef.current = 0 }
  }, [gameState])

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
    const spawner = setInterval(spawnBug, Math.max(800, 2000 - (selectedLevel * 150)))
    return () => { clearInterval(timer); clearInterval(spawner) }
  }, [gameState, spawnBug, sound, selectedLevel])

  const catchBug = useCallback((bugId: number, x: number, y: number, isDanger: boolean, isBoss: boolean) => {
    if (gameState !== 'playing') return
    bugsRef.current = bugsRef.current.map(b => b.id === bugId ? { ...b, caught: true } : b)
    setBugs([...bugsRef.current])
    const particleId = Date.now()
    setParticles(prev => [...prev, { id: particleId, x, y, danger: isDanger || isBoss }])
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== particleId)), 600)
    setTimeout(() => { bugsRef.current = bugsRef.current.filter(b => b.id !== bugId); setBugs([...bugsRef.current]) }, 300)

    if (isBoss) {
      sound()?.bossBug()
      vibrate([100, 30, 100, 30, 100, 30, 200])
      setCaught(prev => Math.max(0, prev - 3))
      setScore(prev => Math.max(0, prev - 30))
    } else if (isDanger) {
      sound()?.dangerBug()
      vibrate([50, 30, 50, 30, 50, 30, 100])
      setCaught(prev => Math.max(0, prev - 1))
      setScore(prev => Math.max(0, prev - 10))
    } else {
      sound()?.catchBug()
      vibrate(30)
      setCaught(prev => {
        const newCount = prev + 1
        setScore(newCount * 10)
        if (newCount >= config.bugsToWin) {
          setGameState('won')
          sound()?.gameWin()
          vibrate([50, 50, 50, 50, 200])
        }
        return newCount
      })
    }
  }, [gameState, config, sound])

  const claimPoints = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bug_catcher_game', level: selectedLevel }),
      })
      if (res.ok) {
        setClaimed(true)
        showToast(`Level ${selectedLevel} complete!`, 'success', config.pointsReward)
        if (selectedLevel === currentLevel && selectedLevel < 10) {
          await fetch('/api/user/level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: selectedLevel + 1 }),
          })
          setCurrentLevel(prev => prev + 1)
        }
        setTimeout(() => {
          setGameState('select')
          setClaimed(false)
          if (selectedLevel < 10) setSelectedLevel(prev => prev + 1)
        }, 2000)
      }
    } catch (e) { console.error(e) }
    finally { setClaiming(false) }
  }

  const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f97316' : '#00ff87'
  const timerPulse = timeLeft <= 5

  // Level Select Screen
  if (gameState === 'select') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <span>←</span><span className="text-sm">Back to dashboard</span>
          </a>
          <div className="flex items-center gap-4">
            <button onClick={() => setSoundOn(s => !s)} className="text-white/40 hover:text-white transition-colors text-sm">
              {soundOn ? '🔊' : '🔇'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐛</span>
              <span className="font-display font-bold tracking-tight">BUG CATCHER</span>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="font-display font-black text-4xl text-white mb-2">SELECT LEVEL</h1>
            <p className="text-white/40">Your current level: <span className="text-[#00ff87] font-bold">Level {userLevel}</span></p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {LEVELS.map(lvl => {
              const locked = lvl.level > userLevel
              const completed = lvl.level < userLevel
              const current = lvl.level === userLevel
              return (
                <button
                  key={lvl.level}
                  onClick={() => !locked && setSelectedLevel(lvl.level)}
                  disabled={locked}
                  className={`relative p-4 rounded-2xl border text-center transition-all
                    ${locked ? 'bg-[#111] border-[#2a2a2a] opacity-40 cursor-not-allowed' :
                      current ? 'bg-[#00ff87]/10 border-[#00ff87] cursor-pointer hover:bg-[#00ff87]/20' :
                      completed ? 'bg-[#111] border-[#00ff87]/30 cursor-pointer hover:border-[#00ff87]/50' :
                      'bg-[#111] border-[#2a2a2a] cursor-pointer hover:border-white/20'}
                    ${selectedLevel === lvl.level ? 'ring-2 ring-[#00ff87]' : ''}`}
                >
                  {completed && <div className="absolute top-2 right-2 text-xs">✅</div>}
                  {locked && <div className="absolute top-2 right-2 text-xs">🔒</div>}
                  {current && <div className="absolute top-2 right-2 text-xs animate-pulse">⭐</div>}
                  <div className="font-display font-black text-2xl text-white mb-1">{lvl.level}</div>
                  <div className="text-white/40 text-xs">+{lvl.pointsReward} pts</div>
                  {lvl.hasBoss && <div className="text-xs text-orange-400 mt-1">👾 Boss</div>}
                </button>
              )
            })}
          </div>

          {/* Selected level info */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-black text-xl text-white">Level {config.level} — {config.title}</h2>
                <p className="text-white/50 text-sm mt-1">{config.description}</p>
              </div>
              <div className="text-right">
                <div className="font-display font-black text-2xl text-[#00ff87]">+{config.pointsReward}</div>
                <div className="text-white/40 text-xs">Bug Points</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Bugs to Catch', value: config.bugsToWin },
                { label: 'Time Limit', value: `${config.timeLimit}s` },
                { label: 'Danger Bugs', value: `${Math.round(config.dangerChance * 100)}%` },
              ].map(s => (
                <div key={s.label} className="bg-[#0a0a0a] rounded-xl p-3">
                  <div className="font-display font-black text-lg text-white">{s.value}</div>
                  <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {config.hasBoss && (
              <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-300 text-center">
                👾 Boss bug warning! Hitting it deducts 3 catches!
              </div>
            )}
          </div>

          <button
            onClick={startGame}
            disabled={selectedLevel > userLevel}
            className="w-full bg-[#00ff87] hover:bg-[#00cc6a] disabled:opacity-50 text-black font-display font-black text-xl py-4 rounded-2xl transition-all hover:scale-[1.02]"
          >
            {selectedLevel > userLevel ? '🔒 Level Locked' : `START LEVEL ${selectedLevel}`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: config.bgColor }}>
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-3 flex items-center justify-between">
        <button onClick={() => setGameState('select')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          ← Levels
        </button>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-display">LEVEL {config.level}</span>
          <button onClick={() => setSoundOn(s => !s)} className="text-white/40 hover:text-white transition-colors text-sm">{soundOn ? '🔊' : '🔇'}</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">

        {/* Playing */}
        {gameState === 'playing' && (
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">Caught:</span>
                <span className="font-display font-black text-2xl text-[#00ff87]">{caught}</span>
                <span className="text-white/30 text-sm">/ {config.bugsToWin}</span>
              </div>
              <div className={`font-display font-black text-3xl transition-colors ${timerPulse ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>
                {timeLeft}s
              </div>
              <div className="text-right">
                <div className="font-display font-black text-lg text-white">{score}</div>
                <div className="text-white/30 text-xs">score</div>
              </div>
            </div>

            <div className="h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-[#00ff87] rounded-full transition-all" style={{ width: `${(caught / config.bugsToWin) * 100}%` }} />
            </div>

            <div ref={containerRef} className="relative border-2 border-[#2a2a2a] rounded-3xl overflow-hidden select-none" style={{ height: '420px', background: 'rgba(255,255,255,0.02)' }}>
              {bugs.map(bug => (
                <button
                  key={bug.id}
                  onClick={() => catchBug(bug.id, bug.x, bug.y, bug.isDanger, bug.isBoss)}
                  className={`absolute transition-all duration-150 hover:scale-125 active:scale-75 ${bug.caught ? 'opacity-0 scale-150' : 'opacity-100'}`}
                  style={{
                    left: bug.x, top: bug.y, fontSize: bug.isBoss ? '48px' : '36px',
                    cursor: 'crosshair',
                    filter: bug.isBoss ? 'drop-shadow(0 0 12px #ff6600)' : bug.isDanger ? 'drop-shadow(0 0 8px #ff4444)' : undefined,
                    transform: `rotate(${bug.direction * (180 / Math.PI)}deg)`,
                  }}
                >
                  {bug.emoji}
                </button>
              ))}
              {particles.map(p => (
                <div key={p.id} className="absolute pointer-events-none text-2xl animate-ping" style={{ left: p.x, top: p.y }}>
                  {p.danger ? '💥' : '✨'}
                </div>
              ))}
              {timeLeft <= 5 && <div className="absolute inset-0 border-4 border-red-500/50 rounded-3xl animate-pulse pointer-events-none" />}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 px-3 py-1.5 rounded-full text-xs text-white/40">
                <span>🐛 = catch</span>
                <span>💀 = -1</span>
                {config.hasBoss && <span>👾 = -3</span>}
              </div>
            </div>
          </div>
        )}

        {/* Won */}
        {gameState === 'won' && (
          <div className="text-center max-w-md">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-2xl px-4 py-2 inline-block mb-3">
              <span className="text-[#00ff87] text-xs font-bold">LEVEL {config.level} — {config.title}</span>
            </div>
            <h1 className="font-display text-4xl font-black text-[#00ff87] mb-2">YOU WIN!</h1>
            <p className="text-white/60 mb-6">You caught {caught} bugs!</p>
            <div className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-2xl">⚡</span>
              <span className="font-display font-black text-2xl text-[#00ff87]">+{config.pointsReward} Bug Points</span>
            </div>
            {selectedLevel < 10 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-6 text-sm text-white/60">
                🔓 Level {selectedLevel + 1} — <span className="text-white font-semibold">{LEVELS[selectedLevel].title}</span> unlocked!
              </div>
            )}
            <div className="flex flex-col gap-3">
              {!claimed ? (
                <button onClick={claimPoints} disabled={claiming} className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105 disabled:opacity-50">
                  {claiming ? 'Claiming...' : `⚡ Claim ${config.pointsReward} Points`}
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
            <div className="text-7xl mb-4">😔</div>
            <h1 className="font-display text-4xl font-black text-white mb-2">SO CLOSE!</h1>
            <p className="text-white/60 mb-2">You caught <span className="text-[#00ff87] font-bold">{caught}</span> out of {config.bugsToWin} bugs</p>
            <p className="text-white/40 text-sm mb-6">You need {config.bugsToWin} to beat Level {config.level}. Try again!</p>
            <div className="flex flex-col gap-3">
              <button onClick={startGame} className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105">
                TRY AGAIN
              </button>
              <button onClick={() => setGameState('select')} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Back to level select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
