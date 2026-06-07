import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { BugCatcherGame } from './BugCatcherGame'

export default async function GamePage() {
  const session = await auth()
  if (!session?.user?.x_id) redirect('/')

  const { data: setting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'game_enabled')
    .single()

  if (setting && !setting.value) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="font-display font-black text-2xl text-white mb-2">Game Closed</h1>
          <p className="text-white/50 mb-6">Bug Catcher is currently unavailable. Check back soon!</p>
          <a href="/dashboard" className="bg-[#00ff87] text-black font-bold px-8 py-3 rounded-xl">Back to Dashboard</a>
        </div>
      </div>
    )
  }

  return <BugCatcherGame />
}
