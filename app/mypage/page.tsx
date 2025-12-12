import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import { MessageCircle } from 'lucide-react' // アイコン追加

export default async function MyPage() {
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

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-800 bg-dark-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent">
            Personal Shopper
          </h1>
          <div className="flex items-center gap-4">
            
            {user.email === 'shawn.sumiya@gmail.com' && (
              <Link 
                href="/admin"
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 transition-colors"
              >
                Admin Panel
              </Link>
            )}

            <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">My Requests</h2>
          <Link
            href="/requests/new"
            className="bg-neon-pink hover:bg-neon-pinkLight text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-neon-pink/20 transition-all hover:scale-105"
          >
            + New Request
          </Link>
        </div>

        {/* リスト表示エリア */}
        {!requests || requests.length === 0 ? (
          <div className="bg-dark-card border border-gray-800 rounded-xl p-10 text-center">
            <div className="text-gray-500 mb-4 text-lg">No requests yet.</div>
            <p className="text-gray-600 mb-6">
              Click the button above to send your first request!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <Link href={`/requests/${req.id}`} key={req.id} className="block group relative">
                {/* ★未読バッジ（ここに追加） */}
                {req.unread_user && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse flex items-center gap-1">
                    <MessageCircle size={12} fill="white" />
                    New
                  </div>
                )}
                
                <div className={`bg-dark-card border rounded-xl p-5 transition-all h-full ${
                  req.unread_user ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-800 group-hover:border-neon-pink/50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      req.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {req.status?.toUpperCase() || 'PENDING'}
                    </span>
                    <span className="text-gray-400 text-sm">${req.budget}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-neon-pink transition-colors">{req.character_name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{req.description || 'No details'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}