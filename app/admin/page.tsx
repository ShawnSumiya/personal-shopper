import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, LayoutGrid } from 'lucide-react' // ★アイコン追加

export default async function AdminDashboard() {
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

  // 管理者チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'shawn.sumiya@gmail.com') {
    redirect('/mypage')
  }

  // 全データ取得
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .order('unread_admin', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ▼ ヘッダー修正箇所 ▼ */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            
            {/* ★ここに追加！Showcase管理画面へのボタン */}
            <Link 
              href="/admin/showcase" 
              className="flex items-center gap-2 bg-neon-pink hover:bg-neon-pinkLight text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-neon-pink/20 transition-all hover:scale-105"
            >
              <LayoutGrid size={18} />
              Manage Showcase
            </Link>
          </div>

          <Link href="/mypage" className="text-gray-400 hover:text-white text-sm border border-gray-700 px-4 py-2 rounded hover:border-gray-500 transition-colors">
            Switch to User View
          </Link>
        </div>
        {/* ▲ ヘッダー修正ここまで ▲ */}

        <div className="grid gap-4">
          {requests?.map((req) => (
            <Link 
              href={`/admin/requests/${req.id}`} 
              key={req.id}
              className={`block bg-dark-card border rounded-xl p-4 transition-colors hover:bg-gray-900 ${
                req.unread_admin ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* 画像サムネイル */}
                <div className="w-16 h-16 bg-black rounded overflow-hidden flex-shrink-0 border border-gray-700">
                  {req.reference_image_url && req.reference_image_url[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={req.reference_image_url[0]} alt="thumb" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                  )}
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{req.character_name}</h3>
                    {/* 未読バッジ */}
                    {req.unread_admin && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <MessageCircle size={10} fill="white" /> New Msg
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 flex gap-4">
                    <span>Budget: ${req.budget}</span>
                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* ステータス */}
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                  req.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {req.status?.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}