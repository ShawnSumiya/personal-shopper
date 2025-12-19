'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

interface Request {
  id: string
  status: string
  ebay_listing_url: string | null
  admin_notes: string | null
}

export default function AdminRequestForm({ request }: { request: Request }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // DBに合わせて初期値も小文字にする
    status: request.status ? request.status.toLowerCase() : 'pending',
    ebay_listing_url: request.ebay_listing_url || '',
    admin_notes: request.admin_notes || '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 全項目をまとめて「裏口関数 (RPC)」で保存
      const { error } = await supabase.rpc('update_request_admin_all', {
        p_request_id: request.id,
        p_status: formData.status, // ここが小文字(pendingなど)で送られます
        p_ebay_url: formData.ebay_listing_url || null,
        p_admin_notes: formData.admin_notes || null
      })

      if (error) throw error

      alert('Updated successfully!')
      router.refresh()
      
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
          {/* ★修正ポイント: valueをすべて小文字に変更しました */}
          <option value="pending">Pending (未対応)</option>
          <option value="negotiation">Negotiation (交渉中)</option>
          <option value="sourced">Sourced (確保済み)</option>
          <option value="listed">Listed (出品済み)</option>
          <option value="completed">Completed (完了)</option>
          <option value="cancelled">Cancelled (キャンセル)</option>
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