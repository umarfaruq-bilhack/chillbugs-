import { supabaseAdmin } from '@/lib/supabase'
import { WLApplication } from '@/components/WLApplication'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  // Check either wl_card_enabled OR wl_application_enabled
  const { data: cardSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'wl_card_enabled')
    .single()

  const { data: fullSetting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'wl_application_enabled')
    .single()

  // Allow access if either setting is enabled
  if (!cardSetting?.value && !fullSetting?.value) {
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
