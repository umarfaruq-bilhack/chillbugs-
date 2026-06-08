import { SignInButton } from '@/components/auth/SignInButton'
import { WalletButton } from '@/components/wallet/WalletButton'
import { Suspense } from 'react'
import { ReferralHandler } from '@/components/ReferralHandler'
import { supabaseAdmin } from '@/lib/supabase'
import { LandingAnimations } from '@/components/LandingAnimations'
import { MobileNav } from '@/components/MobileNav'
import { WLApplication } from '@/components/WLApplication'

const MARQUEE_ITEMS = [
  'CHILL BUGS', 'EARN WL', 'LEADERBOARD', 'BUG CATCHER',
  'EXPLORE', 'NFT DROP', 'DAILY QUESTS', 'CONNECT & EARN',
  'CHILL BUGS', 'EARN WL', 'LEADERBOARD', 'BUG CATCHER',
  'EXPLORE', 'NFT DROP', 'DAILY QUESTS', 'CONNECT & EARN',
]

export const dynamic = 'force-dynamic'
export const revalidate = 0

const WL_TOTAL = 512

export default async function Home() {
  // Check if WL application mode is enabled
  const { data: wlSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'wl_application_enabled')
    .single()

  const wlApplicationEnabled = wlSetting?.value ?? false

  // Fetch tweet URL for WL application
  const { data: tweetSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('text_value')
    .eq('key', 'wl_tweet_url')
    .single()

  const tweetUrl = tweetSetting?.text_value || 'https://twitter.com/TheChillBugs'

  // If WL application is enabled, show full screen application
  if (wlApplicationEnabled) {
    return <WLApplication tweetUrl={tweetUrl} />
  }

  // Fetch real stats from DB
  const { count: playerCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: wlCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('bug_points', 2000)

  const players = playerCount ?? 0
  const wlClaimed = wlCount ?? 0
  const wlPercent = Math.min(Math.round((wlClaimed / WL_TOTAL) * 100), 100)
  const wlLeft = Math.max(WL_TOTAL - wlClaimed, 0)
  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-bg noise relative overflow-x-hidden">
      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>
      <LandingAnimations playerCount={players} wlPercent={wlPercent} />

      {/* Floating bugs — all screen sizes */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-[15%] left-[6%] text-5xl md:text-6xl bug-float-1">🐛</span>
        <span className="absolute top-[60%] left-[3%] text-3xl md:text-4xl bug-float-2">🐞</span>
        <span className="absolute top-[25%] right-[5%] text-4xl md:text-5xl bug-float-3">🦋</span>
        <span className="absolute top-[70%] right-[8%] text-2xl md:text-3xl bug-float-4">🦗</span>
        <span className="absolute top-[45%] left-[15%] text-2xl bug-float-2 hidden md:block">🪲</span>
        <span className="absolute top-[80%] right-[20%] text-3xl bug-float-3 hidden md:block">🐝</span>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5 max-w-6xl mx-auto">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">🐛</span>
          <span className="font-display font-bold text-lg md:text-xl tracking-tight">CHILL BUGS</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#how-it-works" className="hover:text-white transition-colors">The World</a>
          <a href="#earn-wl" className="hover:text-white transition-colors">Earn WL</a>
          <a href="/dashboard?tab=leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
          <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @TheChillBugs
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span className="text-xs md:text-sm text-[#00ff87] font-medium">{wlLeft} WL left</span>
          </div>
          <a href="/dashboard" className="hidden md:block bg-[#00ff87] hover:bg-[#00cc6a] text-black text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            Dashboard
          </a>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left */}
          <div className="flex-1 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-4 py-2 mb-6 anim-hero-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
              <span className="text-[#00ff87] text-xs md:text-sm font-medium">Season 1 — Now Live</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tighter mb-6 anim-hero-2">
              <span className="block text-white">ENTER THE</span>
              <span className="block shimmer-text">BUG</span>
              <span className="block text-white">PLAYGROUND</span>
            </h1>

            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0 anim-hero-3">
              Connect your X account and wallet. Play games, complete daily quests,
              climb the leaderboard — earn your whitelist spot.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-10 mb-8 anim-hero-4">
              {[
                { value: players.toLocaleString(), label: 'Players', id: 'player-count' },
                { value: WL_TOTAL.toLocaleString(), label: 'WL Spots', id: null },
                { value: '4K', label: 'Supply', id: null },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div id={stat.id ?? undefined} className="font-display text-xl md:text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="max-w-sm mx-auto lg:mx-0">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>WL spots claimed</span>
                <span>{wlPercent}% filled</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div id="wl-bar" className="h-full bg-gradient-to-r from-[#00ff87] to-[#00cc6a] rounded-full" style={{ width: `${wlPercent}%` }} />
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-3 gap-3 mt-10 max-w-sm">
              {[
                { icon: '🎮', label: 'Bug Catcher', pts: '+50 pts' },
                { icon: '📅', label: 'Daily Check-in', pts: '+10 pts' },
                { icon: '🏆', label: 'Top 50', pts: 'Guaranteed WL' },
              ].map((task) => (
                <div key={task.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">{task.icon}</div>
                  <div className="text-white/60 text-xs leading-tight">{task.label}</div>
                  <div className="text-[#00ff87] text-xs font-medium mt-1">{task.pts}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — signup card */}
          <div className="w-full lg:w-[400px] shrink-0 anim-hero-5">
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
              <div className="text-center mb-7">
                <div className="text-4xl md:text-5xl mb-3 float-1 inline-block">🐛</div>
                <h2 className="font-display text-xl md:text-2xl font-black text-white mb-1">JOIN THE BUGS</h2>
                <p className="text-white/40 text-sm">2 steps to enter the playground</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-xs font-bold text-[#00ff87] shrink-0">1</div>
                    <span className="text-sm text-white/60 font-medium">Connect your X account</span>
                  </div>
                  <SignInButton />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                  <span className="text-white/20 text-xs">then</span>
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-xs font-bold text-[#00ff87] shrink-0">2</div>
                    <span className="text-sm text-white/60 font-medium">Connect your wallet</span>
                  </div>
                  <WalletButton />
                </div>
              </div>

              <p className="text-center text-white/20 text-xs leading-relaxed">
                We never post on your behalf or access your DMs.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 lg:hidden">
              {[
                { icon: '🎮', label: 'Bug Catcher', pts: '+50 pts' },
                { icon: '📅', label: 'Daily Check-in', pts: '+10 pts' },
                { icon: '🏆', label: 'Top 50', pts: 'Guaranteed WL' },
              ].map((task) => (
                <div key={task.label} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">{task.icon}</div>
                  <div className="text-white/60 text-xs leading-tight">{task.label}</div>
                  <div className="text-[#00ff87] text-xs font-medium mt-1">{task.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works — with ID for nav */}
        <div id="how-it-works" className="mt-20 md:mt-32 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">HOW IT WORKS</h2>
            <p className="text-white/40 text-sm md:text-base">Play, earn, and claim your spot</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', icon: '🔗', title: 'Connect', desc: 'Sign in with X and connect your wallet to create your Bug profile' },
              { step: '02', icon: '🎮', title: 'Play & Earn', desc: 'Catch bugs, complete quests, and check in daily to earn Bug Points' },
              { step: '03', icon: '🏆', title: 'Climb', desc: 'Rise up the leaderboard — top 50 players get guaranteed WL' },
              { step: '04', icon: '💎', title: 'Claim WL', desc: 'Reach 2000 Bug Points for a guaranteed whitelist spot at mint' },
            ].map((item) => (
              <div key={item.step} className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 relative overflow-hidden group hover:border-[#00ff87]/30 transition-colors scroll-hidden">
                <div className="absolute top-4 right-4 font-display text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">{item.step}</div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-black text-white text-lg mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community WL Section */}
        <div className="mt-16 md:mt-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">MORE WAYS TO EARN WL</h2>
            <p className="text-white/40 text-sm md:text-base">Beyond the playground — support the community</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🎮',
                title: 'Play & Earn',
                desc: 'Earn Bug Points through games, daily check-ins, quizzes and referrals on the playground.',
                tag: 'On-site',
                tagColor: 'text-[#00ff87]',
                cta: 'Start Playing',
                href: '/dashboard',
              },
              {
                icon: '🎨',
                title: 'Create Bug Art',
                desc: 'Make fan art of the Chill Bugs collection. Tag @TheChillBugs on X and our team will review for a bonus WL entry.',
                tag: 'Creative',
                tagColor: 'text-purple-400',
                cta: 'Post on X',
                href: 'https://twitter.com/intent/tweet?text=Here%27s%20my%20%40TheChillBugs%20fan%20art!%20%F0%9F%90%9B',
              },
              {
                icon: '📣',
                title: 'Support & Share',
                desc: 'RT, quote tweet, and engage with our official posts. Active community members get noticed for bonus WL spots.',
                tag: 'Social',
                tagColor: 'text-blue-400',
                cta: 'Follow Us',
                href: 'https://twitter.com/TheChillBugs',
              },
              {
                icon: '🤝',
                title: 'Collaborations',
                desc: 'NFT projects, communities and creators — partner with Chill Bugs for exclusive WL allocations.',
                tag: 'Coming Soon',
                tagColor: 'text-white/30',
                cta: 'Coming Soon',
                href: '#',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 flex flex-col hover:border-[#00ff87]/20 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`text-xs font-medium bg-white/5 px-2 py-1 rounded-full ${item.tagColor}`}>{item.tag}</span>
                </div>
                <h3 className="font-display font-black text-white text-lg mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1 mb-4">{item.desc}</p>
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`text-xs font-semibold py-2 px-4 rounded-xl text-center transition-colors
                    ${item.tag === 'Coming Soon'
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-[#00ff87]/10 hover:bg-[#00ff87]/20 text-[#00ff87] border border-[#00ff87]/20'
                    }`}
                >
                  {item.cta} {item.tag !== 'Coming Soon' && '→'}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Earn Bug Points — with ID for nav */}
        <div id="earn-wl" className="mt-16 md:mt-24 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">EARN BUG POINTS</h2>
            <p className="text-white/40 text-sm md:text-base">Complete tasks to climb the leaderboard</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎮', title: 'Bug Catcher', desc: 'Catch 10 bugs flying across the screen in under 30 seconds', pts: '+50 Bug Points', tag: 'Game' },
              { icon: '❓', title: 'Lore Quiz', desc: 'Answer 5 questions about the Chill Bugs universe correctly', pts: '+30 Bug Points', tag: 'Quest' },
              { icon: '📅', title: 'Daily Check-in', desc: 'Visit and tap your bug each day to keep your streak alive', pts: '+10 Bug Points', tag: 'Daily' },
              { icon: '🐦', title: 'Share on X', desc: 'Share the site with your tag using the referral link', pts: '+25 Bug Points', tag: 'Social' },
              { icon: '👥', title: 'Refer a Friend', desc: 'Each friend who signs up through your link earns you points', pts: '+40 Bug Points', tag: 'Referral' },
              { icon: '👑', title: 'Top 50 Leaderboard', desc: 'Stay in the top 50 on the Bug Points leaderboard', pts: 'Guaranteed WL', tag: 'Elite' },
            ].map((task) => (
              <div key={task.title} className="bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 hover:border-[#00ff87]/20 transition-colors group scroll-hidden">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{task.icon}</span>
                  <span className="text-xs font-medium text-white/30 bg-white/5 px-2 py-1 rounded-full">{task.tag}</span>
                </div>
                <h3 className="font-display font-black text-white text-lg mb-2">{task.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">{task.desc}</p>
                <div className="text-[#00ff87] text-sm font-semibold">{task.pts}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Marquee */}
      <div className="relative z-10 border-y border-[#2a2a2a] bg-[#111111] py-3 md:py-4 overflow-hidden">
        <div className="flex marquee-track whitespace-nowrap">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="text-xs md:text-sm font-medium text-white/30 mx-4 md:mx-6 tracking-widest uppercase">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐛</span>
          <span className="font-display font-bold text-sm tracking-tight text-white/60">CHILL BUGS</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/30">
          <a href="/terms" className="hover:text-white/60 transition-colors">Terms</a>
          <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
          <a href="https://twitter.com/TheChillBugs" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @TheChillBugs
          </a>
        </div>
        <p className="text-xs text-white/20">2025 Chill Bugs. All rights reserved.</p>
      </footer>
    </div>
  )
}
