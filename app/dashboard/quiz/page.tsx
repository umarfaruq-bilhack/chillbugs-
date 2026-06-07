import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { LoreQuiz } from './LoreQuiz'

export default async function QuizPage() {
  const session = await auth()
  if (!session?.user?.x_id) redirect('/')

  // Get last quiz time from activities
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('x_id', session.user.x_id)
    .single()

  let lastQuizTime = null
  if (user) {
    const { data: lastQuiz } = await supabaseAdmin
      .from('activities')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('type', 'lore_quiz')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    lastQuizTime = lastQuiz?.created_at || null
  }

  return <LoreQuiz userId={session.user.x_id} lastQuizTime={lastQuizTime} />
}
