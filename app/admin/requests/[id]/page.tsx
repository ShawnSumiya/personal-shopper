import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChatSection from '@/components/ChatSection'
import AdminRequestForm from './AdminRequestForm'

export default async function AdminRequestDetailPage({ params }: { params: { id: string } }) {
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

  const { data: request, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !request) {
    return (
      <div className="min-h-screen bg-dark-bg text-white p-10 flex flex-col items-center justify-center">
        <h1 className="text-xl mb-4">リクエストが見つかりません</h1>
        <Link href="/admin" className="text-neon-pink hover:underline">
          ダッシュボードに戻る
        </Link>
      </div>
    )
  }

  // 画像を配列として正しく処理
  let images: string[] = []
  if (Array.isArray(request.reference_image_url)) {
    images = request.reference_image_url
  } else if (typeof request.reference_image_url === 'string') {
    try {
      const parsed = JSON.parse(request.reference_image_url)
      if (Array.isArray(parsed)) images = parsed
      else images = [request.reference_image_url]
    } catch {
      images = [request.reference_image_url]
    }
  }

  // ユーザー情報を取得
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', request.user_id)
    .single()

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左側：詳細情報と画像ギャラリー */}
          <div className="space-y-6">
            {/* 画像ギャラリー */}
            <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold">Reference Images</h2>
              </div>
              <div className="p-4">
                {images.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-600">
                    No Image
                  </div>
                ) : (
                  <div className={`grid gap-4 ${
                    images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative overflow-hidden rounded border border-gray-800 ${
                          images.length === 1 ? 'h-[500px]' : 'aspect-square'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-contain bg-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="bg-dark-card border border-gray-800 rounded-xl p-6 space-y-4">
              <div>
                <h2 className="text-gray-500 text-sm mb-1">User ID</h2>
                <p className="text-sm font-mono text-gray-300 break-all">{request.user_id}</p>
                {user && (
                  <p className="text-xs text-gray-500 mt-1">
                    {user.email} {user.full_name && `(${user.full_name})`}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Character / Series</h2>
                <p className="text-xl font-bold">{request.character_name}</p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Budget</h2>
                <p className="text-xl font-mono text-neon-pink">${request.budget}</p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Details</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {request.description || '詳細なし'}
                </p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Created At</h2>
                <p className="text-gray-300 text-sm">
                  {new Date(request.created_at).toLocaleString('ja-JP')}
                </p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Updated At</h2>
                <p className="text-gray-300 text-sm">
                  {new Date(request.updated_at).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          {/* 右側：編集フォーム */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-6">Edit Request</h2>
            <AdminRequestForm request={request} />
          </div>
        </div>

        <div className="mt-8">
          <ChatSection requestId={params.id} />
        </div>
      </div>
    </div>
  )
}

