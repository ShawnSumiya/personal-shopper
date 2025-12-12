'use server'

import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateRequest(
  requestId: string,
  data: {
    status?: string
    ebay_listing_url?: string
    admin_notes?: string
  }
) {
  // 管理者権限チェック
  await requireAdmin()

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { error } = await supabase
    .from('requests')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) {
    return { success: false, error: error.message }
  }

  // キャッシュを再検証
  revalidatePath(`/admin/requests/${requestId}`)
  revalidatePath('/admin')

  return { success: true }
}

