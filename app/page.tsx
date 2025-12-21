import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Globe, ShieldCheck, LayoutGrid, User } from 'lucide-react'

export default async function Home() {
  // 1. Supabaseを使って、今アクセスしている人がログイン済みか確認する
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <Link href="/" className="text-xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Personal Shopper
        </Link>
        
        {/* ナビゲーションメニュー */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/showcase" 
            className="text-sm font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Showcase</span>
          </Link>

          {/* ▼ ここが変わりました！ユーザーがいれば My Page、いなければ Login ▼ */}
          {user ? (
            <Link 
              href="/mypage" 
              className="text-sm font-bold text-neon-cyan hover:text-cyan-400 transition-colors flex items-center gap-2 border border-neon-cyan/50 px-3 py-1.5 rounded-full hover:bg-neon-cyan/10"
            >
              <User size={16} />
              My Page
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-bold text-neon-pink hover:text-neon-pinkLight transition-colors"
            >
              Login
            </Link>
          )}
          {/* ▲ ここまで ▲ */}
          
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-neon-pink/50 bg-neon-pink/10 text-neon-pink text-sm font-bold mb-4 animate-pulse">
            Now Accepting Requests
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Your Access to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
              Japanese Goods
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We buy anime merch, games, and exclusive items from Japan 
            and ship them directly to you. Simple, fast, and secure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/requests/new" 
              className="w-full sm:w-auto px-8 py-4 bg-neon-pink hover:bg-neon-pinkLight text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Start Request
            </Link>
            
            <Link 
              href="/showcase" 
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full border border-gray-700 transition-all flex items-center justify-center gap-2 group"
            >
              <LayoutGrid size={20} />
              Browse Showcase
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl text-left">
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4">
              <ShoppingBag />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Anything</h3>
            <p className="text-gray-400">Send us a photo or link of the item you want. We handle the searching.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Buying</h3>
            <p className="text-gray-400">We verify the item condition and handle the purchase safely via eBay.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-pink-500/50 transition-colors">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 mb-4">
              <Globe />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Shipping</h3>
            <p className="text-gray-400">We ship worldwide. Get your favorite Japanese items delivered to your door.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-900 bg-black/40 mt-12">
        <div className="flex flex-col items-center justify-center gap-6">
          
          {/* X (Twitter) Link */}
          {/* ↓ hrefの中身をご自身のXアカウントのURLに書き換えてください */}
          <a 
            href="https://x.com/Get_Japan_Merch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group p-3 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-800 transition-all duration-300"
            aria-label="Follow us on X"
          >
            {/* X Logo SVG */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <p className="text-gray-600 text-sm">
            © 2025 Personal Shopper Service. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}