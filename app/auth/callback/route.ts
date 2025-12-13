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

  // ▼ ここを修正！ (/dashboard -> /showcase)
  // URLにredirect_toパラメータがある場合はそこへ、なければShowcase（商品一覧）へ
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/showcase'

  return NextResponse.redirect(`${origin}${redirectTo}`)
}