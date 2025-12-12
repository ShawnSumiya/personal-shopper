'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    // 確認ダイアログ（英語）
    if (!window.confirm('Are you sure you want to delete this request?\n(This action cannot be undone)')) {
      return
    }

    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId)

    if (error) {
      alert('Failed to delete request.')
      setLoading(false)
    } else {
      router.push('/mypage')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 rounded-lg transition-all"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      {/* ここを日本語から英語に変更 */}
      <span>Cancel Request</span>
    </button>
  )
}