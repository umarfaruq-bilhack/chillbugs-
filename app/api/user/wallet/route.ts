import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.x_id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { wallet_address } = await req.json()

  if (!wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  // Check wallet isn't already used by another user
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('x_id')
    .eq('wallet_address', wallet_address)
    .neq('x_id', session.user.x_id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Wallet already linked to another account' },
      { status: 409 }
    )
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ wallet_address })
    .eq('x_id', session.user.x_id)

  if (error) {
    return NextResponse.json({ error: 'Failed to link wallet' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
