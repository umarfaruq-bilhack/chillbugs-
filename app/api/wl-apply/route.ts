import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { x_username, discord_username, wallet_address, referral_code } = await req.json()

  if (!x_username || !wallet_address) {
    return NextResponse.json({ error: 'X username and wallet address are required' }, { status: 400 })
  }

  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from('wl_applications')
    .select('id')
    .eq('x_username', x_username.toLowerCase().replace('@', ''))
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You have already applied for the whitelist' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from('wl_applications')
    .insert({
      x_username: x_username.toLowerCase().replace('@', ''),
      discord_username,
      wallet_address,
      referral_code,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}

export async function GET() {
  // Public endpoint to check settings
  const { data } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'wl_application_enabled')
    .single()

  return NextResponse.json({ enabled: data?.value ?? false })
}
