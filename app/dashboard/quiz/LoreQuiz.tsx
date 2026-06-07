'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

// Sound engine
function createQuizSound() {
  if (typeof window === 'undefined') return null
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const play = (freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = type
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      osc.start()
      osc.stop(ctx.currentTime + dur)
    }
    return {
      correct: () => {
        play(600, 0.1, 'sine', 0.25)
        setTimeout(() => play(900, 0.15, 'sine', 0.2), 100)
      },
      wrong: () => {
        play(250, 0.15, 'sawtooth', 0.3)
        setTimeout(() => play(200, 0.2, 'sawtooth', 0.25), 120)
      },
      win: () => {
        [500, 600, 700, 900, 1100].forEach((f, i) => setTimeout(() => play(f, 0.2, 'sine', 0.2), i * 100))
      },
      lose: () => {
        [400, 300, 200].forEach((f, i) => setTimeout(() => play(f, 0.2, 'sawtooth', 0.25), i * 120))
      },
    }
  } catch { return null }
}

const ALL_QUESTIONS = [
  // World & Lore
  { q: 'What is the name of the Chill Bugs home zone?', options: ['Bug Valley', 'Chill Forest', 'The Playground', 'Bug Den'], answer: 1 },
  { q: 'How many Chill Bugs will exist in the collection?', options: ['5,000', '8,888', '4,000', '10,000'], answer: 2 },
  { q: 'What is the main currency earned on the Chill Bugs platform?', options: ['Chill Coins', 'Bug Bucks', 'Bug Points', 'NFT Credits'], answer: 2 },
  { q: 'Where do Chill Bugs live?', options: ['The Metaverse', 'Chill Forest', 'Bug Valley', 'The Playground'], answer: 1 },
  { q: 'What type of project is Chill Bugs?', options: ['DeFi Protocol', 'NFT Collection', 'DAO', 'GameFi Token'], answer: 1 },
  { q: 'What is the Chill Bugs arcade zone called?', options: ['Game Hub', 'Bug Arcade', 'Arcade Zone', 'Bug Games'], answer: 2 },
  { q: 'Where can you see the global rankings on Chill Bugs?', options: ['Profile page', 'Bug Den', 'Leaderboard', 'Dashboard'], answer: 2 },
  { q: 'What color is the primary accent color of the Chill Bugs brand?', options: ['Blue', 'Purple', 'Green', 'Orange'], answer: 2 },
  { q: 'What is the name of the Chill Bugs leaderboard section?', options: ['Bug Den', 'Rankings', 'Leaderboard', 'Top Players'], answer: 2 },
  { q: 'What season is Chill Bugs currently in?', options: ['Season 0', 'Season 1', 'Season 2', 'Beta'], answer: 1 },

  // Points & WL
  { q: 'How many Bug Points do you earn from a daily check-in?', options: ['5', '10', '20', '50'], answer: 1 },
  { q: 'How many Bug Points do you earn from the Bug Catcher game?', options: ['25', '30', '40', '50'], answer: 3 },
  { q: 'How many Bug Points do you earn from the Lore Quiz?', options: ['20', '25', '30', '40'], answer: 2 },
  { q: 'How many Bug Points do you earn by sharing on X?', options: ['10', '15', '20', '25'], answer: 3 },
  { q: 'How many Bug Points do you earn per referral?', options: ['20', '30', '40', '50'], answer: 2 },
  { q: 'How many Bug Points does a referred user receive as a welcome bonus?', options: ['5', '10', '15', '20'], answer: 1 },
  { q: 'How many Bug Points do you need for a guaranteed WL?', options: ['500', '1000', '1500', '2000'], answer: 3 },
  { q: 'What is the maximum rank for guaranteed whitelist?', options: ['Top 10', 'Top 25', 'Top 50', 'Top 100'], answer: 2 },
  { q: 'What is the total maximum points you can earn in a single day from check-in?', options: ['5', '10', '15', '20'], answer: 1 },
  { q: 'How many times can you earn referral bonus points per friend?', options: ['Once', 'Twice', 'Three times', 'Unlimited'], answer: 0 },

  // Games
  { q: 'How many bugs do you need to catch in the Bug Catcher game?', options: ['5', '8', '10', '15'], answer: 2 },
  { q: 'How many seconds do you have in the Bug Catcher game?', options: ['20', '30', '45', '60'], answer: 1 },
  { q: 'What happens when you click a danger bug in Bug Catcher?', options: ['Game over', 'Score doubles', 'Count reduces by 1', 'Timer freezes'], answer: 2 },
  { q: 'What percentage chance does a danger bug appear in Bug Catcher?', options: ['10%', '15%', '20%', '25%'], answer: 3 },
  { q: 'What emoji indicates a danger bug in the game?', options: ['🐛', '💀', '🌿', '⭐'], answer: 1 },
  { q: 'What happens to bugs as the timer runs low in Bug Catcher?', options: ['They disappear', 'They move faster', 'They multiply', 'They freeze'], answer: 1 },
  { q: 'How many questions are in the Lore Quiz?', options: ['3', '5', '7', '10'], answer: 1 },
  { q: 'What is the minimum score needed to pass the Lore Quiz?', options: ['3/5', '4/5', '5/5', '2/5'], answer: 1 },
  { q: 'How often can you play the Bug Catcher game for points?', options: ['Once per hour', 'Once per day', 'Unlimited', 'Once per week'], answer: 1 },
  { q: 'What sound plays when you catch a good bug?', options: ['Explosion', 'Pop sound', 'Bell chime', 'No sound'], answer: 1 },

  // Community & Social
  { q: 'What is the official Chill Bugs Twitter/X handle?', options: ['@ChillBugs', '@TheChillBugs', '@Chill_Bugs', '@ChillBugsNFT'], answer: 1 },
  { q: 'What should you do to earn a bonus WL from fan art?', options: ['Post on Instagram', 'Tag @TheChillBugs on X', 'Submit via email', 'DM the team'], answer: 1 },
  { q: 'What is the domain name of the Chill Bugs website?', options: ['chillbugs.io', 'chillbugs.com', 'chillbugs.xyz', 'chillbugs.net'], answer: 2 },
  { q: 'What opens for collaboration on Chill Bugs?', options: ['Partner NFTs', 'Art collab', 'Community events', 'Coming soon'], answer: 3 },
  { q: 'How can you refer a friend on Chill Bugs?', options: ['Share your wallet', 'Share your referral link', 'Invite via email', 'Share your username'], answer: 1 },
  { q: 'What is the referral code format on Chill Bugs?', options: ['CB-XXXXXX', 'BUG-XXXXXXXX', 'REF-XXXXX', 'CHILL-XXX'], answer: 1 },
  { q: 'How many ways can you earn WL spots on Chill Bugs?', options: ['2', '3', '4', '5+'], answer: 3 },
  { q: 'What type of content earns a bonus WL on Chill Bugs?', options: ['Memes only', 'Fan art tagged @TheChillBugs', 'Screenshots', 'Reviews'], answer: 1 },
  { q: 'What blockchain does Chill Bugs primarily support for wallets?', options: ['Solana only', 'Bitcoin only', 'Ethereum & EVM chains', 'Cardano'], answer: 2 },
  { q: 'What wallets can you connect to Chill Bugs?', options: ['MetaMask only', 'Phantom only', 'Multiple wallets via RainbowKit', 'Hardware wallets only'], answer: 2 },

  // Streaks & Activities
  { q: 'What is a streak in Chill Bugs?', options: ['Points multiplier', 'Consecutive daily check-ins', 'Referral chain', 'Game winning streak'], answer: 1 },
  { q: 'What breaks your streak on Chill Bugs?', options: ['Losing the game', 'Missing a daily check-in', 'Wrong quiz answer', 'Disconnecting wallet'], answer: 1 },
  { q: 'How often can you do the daily check-in?', options: ['Every 12 hours', 'Once per day', 'Twice per day', 'Every 6 hours'], answer: 1 },
  { q: 'How often can you take the Lore Quiz?', options: ['Once per day', 'Every 7 hours', 'Once per week', 'Unlimited'], answer: 1 },
  { q: 'What activity section shows your past actions on Chill Bugs?', options: ['History', 'Recent Activity', 'Timeline', 'Log'], answer: 1 },
  { q: 'Where can you see your Bug Points total?', options: ['Profile only', 'Dashboard stats', 'Leaderboard only', 'Activity tab'], answer: 1 },
  { q: 'How many tabs are on the Chill Bugs dashboard?', options: ['2', '3', '4', '5'], answer: 1 },
  { q: 'What are the three dashboard tabs?', options: ['Games, Quests, Rewards', 'Tasks, Leaderboard, Activity', 'Play, Earn, Claim', 'Home, Profile, Settings'], answer: 1 },
  { q: 'What does the WL Progress bar show on the dashboard?', options: ['Game score', 'Points toward 2000 WL threshold', 'Referral count', 'Streak length'], answer: 1 },
  { q: 'What color does your streak count display in?', options: ['Green', 'White', 'Orange', 'Purple'], answer: 2 },

  // NFT & Web3
  { q: 'What does WL stand for in NFT culture?', options: ['Wallet Link', 'Whitelist', 'Web Ledger', 'Winner List'], answer: 1 },
  { q: 'What does minting an NFT mean?', options: ['Selling it', 'Creating it on the blockchain', 'Burning it', 'Transferring it'], answer: 1 },
  { q: 'What is a smart contract?', options: ['Legal NFT agreement', 'Self-executing blockchain code', 'NFT metadata', 'Wallet password'], answer: 1 },
  { q: 'What is gas fee in crypto?', options: ['Transaction cost on blockchain', 'NFT storage fee', 'Wallet creation fee', 'Marketplace listing fee'], answer: 0 },
  { q: 'What does DYOR mean in crypto?', options: ['Do Your Own Research', 'Decentralize Your Own Resources', 'Deploy Your Own Rules', 'Design Your Own Rewards'], answer: 0 },
  { q: 'What is a floor price for an NFT collection?', options: ['Cheapest NFT available', 'Most expensive NFT', 'Average price', 'Starting mint price'], answer: 0 },
  { q: 'What does WAGMI mean in crypto culture?', options: ['We Are Getting More Income', 'We Are Gonna Make It', 'Wallets Are Growing Marginally Inactive', 'Web3 Advocates Getting More Involved'], answer: 1 },
  { q: 'What is a rug pull in NFT space?', options: ['Art style', 'Scam where devs abandon project', 'NFT burn event', 'Community vote'], answer: 1 },
  { q: 'What does GM mean in crypto Twitter?', options: ['Good Market', 'General Meeting', 'Good Morning', 'Governance Model'], answer: 2 },
  { q: 'What is an NFT holder?', options: ['Physical storage', 'Someone who owns an NFT', 'NFT creator', 'Smart contract'], answer: 1 },

  // Bug Knowledge
  { q: 'Which of these is NOT a bug emoji used in the Bug Catcher game?', options: ['🐛', '🐞', '🦋', '🦗'], answer: 2 },
  { q: 'What color glow do danger bugs have in the game?', options: ['Blue', 'Yellow', 'Red', 'Purple'], answer: 2 },
  { q: 'What happens at the end of a Bug Catcher game if you win?', options: ['Auto redirect', 'Claim points button appears', 'New game starts', 'Confetti only'], answer: 1 },
  { q: 'What particle effect appears when you catch a good bug?', options: ['💥', '✨', '⭐', '🌟'], answer: 1 },
  { q: 'What particle effect appears when you hit a danger bug?', options: ['✨', '💫', '💥', '❌'], answer: 2 },
  { q: 'What vibration pattern happens when you catch a good bug?', options: ['Long buzz', 'Short satisfying buzz', 'Rapid multiple', 'No vibration'], answer: 1 },
  { q: 'What vibration pattern happens when you hit a danger bug?', options: ['Single long buzz', 'No vibration', 'Rapid intense pattern', 'Double buzz'], answer: 2 },
  { q: 'How many bugs spawn at the start of Bug Catcher?', options: ['3', '4', '5', '6'], answer: 3 },
  { q: 'How often do new bugs spawn during Bug Catcher?', options: ['Every second', 'Every 3 seconds', 'Every 5 seconds', 'Every 10 seconds'], answer: 1 },
  { q: 'What sound plays when the Bug Catcher timer is running low?', options: ['Alarm', 'Tick tick tick', 'Music speeds up', 'Silence'], answer: 1 },

  // Platform & Tech
  { q: 'What do you need to sign up on Chill Bugs?', options: ['Email only', 'X account + wallet', 'Discord + wallet', 'Email + phone'], answer: 1 },
  { q: 'What blockchain standard are Chill Bugs NFTs likely based on?', options: ['ERC-20', 'ERC-721', 'ERC-1155', 'BEP-20'], answer: 1 },
  { q: 'What does connecting your wallet allow on Chill Bugs?', options: ['Earn more points', 'Complete your profile for WL', 'Access all games', 'Get free NFTs'], answer: 1 },
  { q: 'What happens to your data when you sign out of Chill Bugs?', options: ['It is deleted', 'Saved to your account', 'Exported to email', 'Transferred to wallet'], answer: 1 },
  { q: 'What login method does Chill Bugs use for X accounts?', options: ['Username/password', 'OAuth 2.0', 'API key', 'QR code'], answer: 1 },
  { q: 'What database does Chill Bugs use to store user data?', options: ['Firebase', 'MongoDB', 'Supabase', 'MySQL'], answer: 2 },
  { q: 'What framework is the Chill Bugs website built with?', options: ['React only', 'Next.js', 'Vue.js', 'Angular'], answer: 1 },
  { q: 'What is the Chill Bugs referral system based on?', options: ['Wallet addresses', 'Unique referral codes', 'X usernames', 'Email addresses'], answer: 1 },
  { q: 'How are Bug Points stored on Chill Bugs?', options: ['On blockchain', 'In a database', 'In your wallet', 'In local storage'], answer: 1 },
  { q: 'What happens to your Bug Points if you disconnect your wallet?', options: ['Reset to zero', 'Locked until reconnected', 'Kept safely in database', 'Transferred to wallet'], answer: 2 },

  // Fun & Trivia
  { q: 'What is the mascot of Chill Bugs?', options: ['A ladybug', 'A caterpillar/bug', 'A butterfly', 'A beetle'], answer: 1 },
  { q: 'What vibe does Chill Bugs aim for?', options: ['Serious and corporate', 'Fun, gamified, community-driven', 'Academic and educational', 'Exclusive and elite'], answer: 1 },
  { q: 'What makes Chill Bugs different from typical NFT mint sites?', options: ['Lower price', 'Interactive gamified WL experience', 'More supply', 'Celebrity endorsement'], answer: 1 },
  { q: 'What is the Bug Den section?', options: ['A game zone', 'Leaderboard and stats section', 'NFT gallery', 'Lore section'], answer: 1 },
  { q: 'Which activity earns the most points in one action?', options: ['Daily check-in', 'Lore Quiz', 'Referral', 'Bug Catcher game'], answer: 3 },
  { q: 'What is the minimum number of correct quiz answers to earn points?', options: ['3', '4', '5', '2'], answer: 1 },
  { q: 'What does the marquee ticker show on the Chill Bugs landing page?', options: ['Live prices', 'Rotating site keywords', 'News feed', 'Player count'], answer: 1 },
  { q: 'What is displayed in the top right of the landing page nav?', options: ['Login button', 'WL spots remaining', 'Bug Points', 'Timer'], answer: 1 },
  { q: 'How many WL spots are available in Season 1?', options: ['256', '512', '1024', '2048'], answer: 1 },
  { q: 'What does the progress bar on the landing page show?', options: ['Game progress', 'Percentage of WL spots claimed', 'Total supply minted', 'Points needed'], answer: 1 },
]

function getRandomQuestions(count: number, seed: string): typeof ALL_QUESTIONS {
  const hash = seed.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
  const shuffled = [...ALL_QUESTIONS]
  let s = Math.abs(hash)
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export function LoreQuiz({ userId, lastQuizTime }: { userId: string; lastQuizTime: string | null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [questions] = useState(() => getRandomQuestions(5, `${userId}-${new Date().toDateString()}`))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [state, setState] = useState<'quiz' | 'result'>('quiz')
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [cooldownMsg, setCooldownMsg] = useState('')
  const [soundOn, setSoundOn] = useState(true)
  const soundRef = useRef<ReturnType<typeof createQuizSound>>(null)

  useEffect(() => {
    soundRef.current = createQuizSound()
  }, [])

  const sound = () => soundOn ? soundRef.current : null

  // Check 7hr cooldown
  useEffect(() => {
    if (lastQuizTime) {
      const last = new Date(lastQuizTime).getTime()
      const now = Date.now()
      const sevenHrs = 7 * 60 * 60 * 1000
      const diff = now - last
      if (diff < sevenHrs) {
        const remaining = sevenHrs - diff
        const hrs = Math.floor(remaining / (1000 * 60 * 60))
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setCooldownMsg(`Come back in ${hrs}h ${mins}m`)
      }
    }
  }, [lastQuizTime])

  const question = questions[current]
  const correct = answers.filter(Boolean).length
  const passed = correct >= 4

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === question.answer
    if (isCorrect) {
      sound()?.correct()
    } else {
      sound()?.wrong()
    }
  }

  const handleNext = () => {
    if (selected === null) return
    const isCorrect = selected === question.answer
    const newAnswers = [...answers, isCorrect]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      setState('result')
      const passed = newAnswers.filter(Boolean).length >= 4
      setTimeout(() => passed ? sound()?.win() : sound()?.lose(), 300)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  const claimPoints = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lore_quiz' }),
      })
      if (res.ok) {
        setClaimed(true)
        showToast('Quiz passed!', 'success', 30)
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        const data = await res.json()
        setCooldownMsg(data.error || 'Already completed recently')
        setClaimed(true)
      }
    } finally {
      setClaiming(false)
    }
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setState('quiz')
    setClaimed(false)
  }

  // Show cooldown as a top banner instead of full page
  if (cooldownMsg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <span>←</span><span className="text-sm">Back to dashboard</span>
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐛</span>
            <span className="font-display font-bold tracking-tight">CHILL BUGS</span>
          </div>
        </nav>

        {/* Compact cooldown banner */}
        <div className="mx-4 mt-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <div>
              <p className="text-orange-400 font-semibold text-sm">Quiz on cooldown</p>
              <p className="text-white/40 text-xs">{cooldownMsg}</p>
            </div>
          </div>
          <a href="/dashboard" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shrink-0">
            Dashboard
          </a>
        </div>

        {/* Show quiz preview dimmed */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 opacity-30 pointer-events-none select-none">
          <div className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/40 text-sm">Question 1 of 5</span>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-1.5 rounded-full bg-white/10" />
                ))}
              </div>
            </div>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 mb-4">
              <div className="text-4xl mb-6 text-center">❓</div>
              <h2 className="font-display font-black text-xl text-white text-center mb-8">
                Ready to test your Chill Bugs knowledge?
              </h2>
              <div className="space-y-3">
                {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, i) => (
                  <div key={i} className="w-full border border-[#2a2a2a] rounded-2xl px-5 py-4 text-sm text-white/30">
                    <span className="mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full bg-[#00ff87]/30 text-black font-display font-black text-lg py-4 rounded-2xl text-center">
              Next Question →
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <span>←</span><span className="text-sm">Back to dashboard</span>
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
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {state === 'quiz' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/40 text-sm">Question {current + 1} of {questions.length}</span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <div key={i} className={`w-8 h-1.5 rounded-full transition-colors
                      ${i < current ? 'bg-[#00ff87]' : i === current ? 'bg-[#00ff87]/50' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 mb-4">
                <div className="text-4xl mb-6 text-center">❓</div>
                <h2 className="font-display font-black text-xl md:text-2xl text-white text-center mb-8 leading-tight">
                  {question.q}
                </h2>
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    let style = 'bg-[#0a0a0a] border-[#2a2a2a] text-white/70 hover:border-white/30 hover:text-white'
                    if (selected !== null) {
                      if (i === question.answer) style = 'bg-[#00ff87]/10 border-[#00ff87] text-[#00ff87]'
                      else if (i === selected && i !== question.answer) style = 'bg-red-500/10 border-red-500 text-red-400'
                      else style = 'bg-[#0a0a0a] border-[#2a2a2a] text-white/30'
                    }
                    return (
                      <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                        className={`w-full text-left border rounded-2xl px-5 py-4 text-sm md:text-base font-medium transition-all ${style}`}>
                        <span className="text-white/30 mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={handleNext} disabled={selected === null}
                className="w-full bg-[#00ff87] hover:bg-[#00cc6a] disabled:opacity-30 disabled:cursor-not-allowed text-black font-display font-black text-lg py-4 rounded-2xl transition-all">
                {current + 1 === questions.length ? 'See Results' : 'Next Question →'}
              </button>
            </>
          )}

          {state === 'result' && (
            <div className="text-center">
              <div className="text-7xl mb-6">{passed ? '🎉' : '😔'}</div>
              <h1 className="font-display text-4xl md:text-5xl font-black mb-3" style={{ color: passed ? '#00ff87' : 'white' }}>
                {passed ? 'PASSED!' : 'SO CLOSE!'}
              </h1>
              <p className="text-white/60 text-lg mb-2">
                You got <span className="text-[#00ff87] font-bold">{correct}</span> out of {questions.length} correct
              </p>
              <p className="text-white/40 text-sm mb-8">
                {passed ? 'You know your Chill Bugs lore! 🐛' : 'You need 4/5 correct. Try again in 7 hours!'}
              </p>

              {passed && (
                <div className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-6 py-3 mb-8">
                  <span className="text-2xl">⚡</span>
                  <span className="font-display font-black text-2xl text-[#00ff87]">+30 Bug Points</span>
                </div>
              )}

              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 mb-8 text-left">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[#2a2a2a] last:border-0">
                    <span className="text-lg">{answers[i] ? '✅' : '❌'}</span>
                    <div>
                      <p className="text-white/70 text-sm">{q.q}</p>
                      {!answers[i] && <p className="text-[#00ff87] text-xs mt-0.5">Answer: {q.options[q.answer]}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {passed && !claimed && (
                  <button onClick={claimPoints} disabled={claiming}
                    className="bg-[#00ff87] hover:bg-[#00cc6a] text-black font-display font-black text-xl px-12 py-4 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 glow-btn">
                    {claiming ? 'Claiming...' : '⚡ Claim 30 Points'}
                  </button>
                )}
                {claimed && (
                  <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-2xl px-12 py-4 text-[#00ff87] font-bold text-lg">
                    ✅ Points claimed! Redirecting...
                  </div>
                )}
                {!passed && (
                  <p className="text-white/30 text-sm">Come back in 7 hours to try again!</p>
                )}
                <a href="/dashboard" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                  Back to dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
