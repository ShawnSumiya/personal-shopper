'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateRequest } from '../../actions'

interface Request {
  id: string
  status: string
  ebay_listing_url: string | null
  admin_notes: string | null
}

export default function AdminRequestForm({ request }: { request: Request }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)

  const [formData, setFormData] = useState({
    status: request.status || 'pending',
    ebay_listing_url: request.ebay_listing_url || '',
    admin_notes: request.admin_notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateRequest(request.id, {
        status: formData.status,
        ebay_listing_url: formData.ebay_listing_url || undefined,
        admin_notes: formData.admin_notes || undefined,
      })

      if (result.success) {
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          router.refresh()
        }, 2000)
      } else {
        alert(`エラー: ${result.error}`)
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-pink"
            disabled={isPending}
          >
            <option value="pending">Pending</option>
            <option value="negotiation">Negotiation</option>
            <option value="sourced">Sourced</option>
            <option value="listed">Listed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* eBay URL */}
        <div>
          <label htmlFor="ebay_url" className="block text-sm font-medium text-gray-400 mb-2">
            eBay Listing URL
          </label>
          <input
            type="url"
            id="ebay_url"
            value={formData.ebay_listing_url}
            onChange={(e) => setFormData({ ...formData, ebay_listing_url: e.target.value })}
            placeholder="https://www.ebay.com/..."
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-pink"
            disabled={isPending}
          />
        </div>

        {/* Admin Notes */}
        <div>
          <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-400 mb-2">
            Admin Notes
          </label>
          <textarea
            id="admin_notes"
            value={formData.admin_notes}
            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
            placeholder="管理者用メモを入力..."
            rows={6}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-pink resize-none"
            disabled={isPending}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-neon-pink hover:bg-neon-pinkLight text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5">
          Updated!
        </div>
      )}
    </>
  )
}

