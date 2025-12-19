'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

// データ型定義（あなたのコードに合わせています）
interface Request {
  id: string
  status: string
  ebay_listing_url: string | null
  admin_notes: string | null
}

export default function AdminRequestForm({ request }: { request: Request }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // フォームの状態管理
  const [formData, setFormData] = useState({
    status: request.status || 'Pending',
    ebay_listing_url: request.ebay_listing_url || '',
    admin_notes: request.admin_notes || '',
  })

  // Supabaseクライアント作成
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ---------------------------------------------------------
      // 1. ステータスの更新 (ここがエラーの原因でした！)
      // 普通の update ではなく、「裏口関数 (RPC)」を使って更新します
      // ---------------------------------------------------------
      if (formData.status !== request.status) {
        const { error: statusError } = await supabase.rpc('update_request_status', {
          p_request_id: request.id,
          p_status: formData.status
        })
        
        if (statusError) throw statusError
      }

      // ---------------------------------------------------------
      // 2. その他の情報の更新 (eBay URL, メモ)
      // ステータス以外は通常の update で更新します
      // ---------------------------------------------------------
      const { error: infoError } = await supabase
        .from('requests')
        .update({
          ebay_listing_url: formData.ebay_listing_url || null,
          admin_notes: formData.admin_notes || null,
        })
        .eq('id', request.id)

      if (infoError) throw infoError

      // 成功時
      alert('Updated successfully!')
      router.refresh() // 画面を更新して最新の状態にする
      
    } catch (error: any) {
      console.error('Error updating request:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-bold text-gray-400 mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink"
          disabled={loading}
        >
          <option value="Pending">Pending (未対応)</option>
          <option value="Negotiation">Negotiation (交渉中)</option>
          <option value="Sourced">Sourced (確保済み)</option>
          <option value="Listed">Listed (出品済み)</option>
          <option value="Completed">Completed (完了)</option>
          <option value="Cancelled">Cancelled (キャンセル)</option>
        </select>
      </div>

      {/* eBay Listing URL */}
      <div>
        <label htmlFor="ebay_url" className="block text-sm font-bold text-gray-400 mb-2">
          eBay Listing URL
        </label>
        <input
          type="url"
          id="ebay_url"
          value={formData.ebay_listing_url}
          onChange={(e) => setFormData({ ...formData, ebay_listing_url: e.target.value })}
          placeholder="https://www.ebay.com/itm/..."
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink"
          disabled={loading}
        />
      </div>

      {/* Admin Notes */}
      <div>
        <label htmlFor="admin_notes" className="block text-sm font-bold text-gray-400 mb-2">
          Admin Notes
        </label>
        <textarea
          id="admin_notes"
          value={formData.admin_notes}
          onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
          placeholder="管理者用メモ (ユーザーには見えません)..."
          rows={6}
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink resize-none"
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-neon-pink hover:bg-neon-pinkLight text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </>
        )}
      </button>
    </form>
  )
}