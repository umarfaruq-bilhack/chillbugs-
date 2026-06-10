import { supabaseAdmin } from '@/lib/supabase'
import { WLApplication } from '@/components/WLApplication'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const { data: wlSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'wl_application_enabled')
    .single()

  // If WL application is disabled, redirect to home
  if (!wlSetting?.value) {
    redirect('/')
  }

  const { data: tweetSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('text_value')
    .eq('key', 'wl_tweet_url')
    .single()

  const tweetUrl = tweetSetting?.text_value || 'https://twitter.com/TheChillBugs'

  return <WLApplication tweetUrl={tweetUrl} />
}
