import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URLにredirect_toパラメータがある場合はそこへ、なければダッシュボードへ
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

  return NextResponse.redirect(`${origin}${redirectTo}`)
}

