import Link from 'next/link'
import { ArrowRight, ShoppingBag, Globe, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-gray-900">
        <div className="text-xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent">
          Personal Shopper
        </div>
        <Link 
          href="/login" 
          className="text-sm font-bold hover:text-neon-pink transition-colors"
        >
          Login
        </Link>
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
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-neon-pink hover:bg-neon-pinkLight text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Start Request
            </Link>
            <Link 
              href="/login" // ログイン画面へ誘導
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full border border-gray-700 transition-all flex items-center justify-center gap-2"
            >
              Log In
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl text-left">
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4">
              <ShoppingBag />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Anything</h3>
            <p className="text-gray-400">Send us a photo or link of the item you want. We handle the searching.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Buying</h3>
            <p className="text-gray-400">We verify the item condition and handle the purchase safely via eBay.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 mb-4">
              <Globe />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Shipping</h3>
            <p className="text-gray-400">We ship worldwide. Get your favorite Japanese items delivered to your door.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-gray-900">
        © 2025 Personal Shopper Service. All rights reserved.
      </footer>
    </div>
  )
}